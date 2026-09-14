'use client'

import { useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Loader2,
  ReceiptText,
  Send,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCategories } from '@/queries/categories/useCategories'
import { useSubcategories } from '@/queries/subcategories/useSubcategories'
import { fileToBase64 } from '@/queries/chat/sendChat'
import { compressImage } from '@/utils/compressImage'
import {
  proposeReceipt,
  refineReceipt,
  ProposedTransaction,
} from '@/queries/receipts/proposeReceipt'
import {
  addTransactionV2,
  PostTransactionTypeV2,
} from '@/queries/transactions/addTransaction'
import { invalidateTransactionQueries } from '@/queries/transactions/invalidateTransactionQueries'
import { toRFC3339 } from '@/utils/to-rfc3339'

type CreateFromReceiptProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const SCAN_PROMPT = 'Please scan this receipt.'

export const CreateFromReceipt = ({
  open,
  onOpenChange,
}: CreateFromReceiptProps) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: categories } = useCategories()
  const { data: subcategories } = useSubcategories()

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // Base64 of the compressed image, kept so a clarification answer can re-scan
  // the same photo without re-reading the file.
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [items, setItems] = useState<ProposedTransaction[] | null>(null)
  const [clarification, setClarification] = useState<string | null>(null)
  const [correction, setCorrection] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProposing, setIsProposing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const categoriesById = useMemo(() => {
    const map = new Map<number, string>()
    categories?.forEach((category) => map.set(category.id, category.name))
    return map
  }, [categories])

  const subcategoriesById = useMemo(() => {
    const map = new Map<number, string>()
    subcategories?.forEach((subcategory) =>
      map.set(subcategory.id, subcategory.name)
    )
    return map
  }, [subcategories])

  const reset = () => {
    setFile(null)
    setPreviewUrl(null)
    setImageBase64(null)
    setItems(null)
    setClarification(null)
    setCorrection('')
    setError(null)
    setIsProposing(false)
    setIsCreating(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    event.target.value = ''
    if (!selected) return
    setError(null)
    setFile(selected)
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(selected)
  }

  const applyResult = (
    result: Awaited<ReturnType<typeof proposeReceipt>>
  ): boolean => {
    if (!result.success) {
      setError(result.error || 'Não consegui ler essa nota. Tente outra foto.')
      return false
    }
    setItems(result.items ?? [])
    setClarification(result.needsClarification ? result.question : null)
    return true
  }

  const handleScan = async () => {
    if (!file || isProposing) return
    setIsProposing(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      const base64 = await fileToBase64(compressed)
      setImageBase64(base64)
      const result = await proposeReceipt([
        { type: 'text', content: SCAN_PROMPT },
        { type: 'image', content: base64 },
      ])
      applyResult(result)
    } catch (scanError) {
      console.error(scanError)
      setError('Não consegui falar com o assistente. Tente novamente.')
    } finally {
      setIsProposing(false)
    }
  }

  const handleCorrection = async () => {
    const text = correction.trim()
    if (!text || isProposing) return
    setIsProposing(true)
    setError(null)
    try {
      // While a clarification is open we answer the scanner's question, so
      // re-scan the same photo with the answer as context. Otherwise it's a
      // surgical edit to the current proposal.
      const result =
        clarification && imageBase64
          ? await proposeReceipt([
              { type: 'text', content: text },
              { type: 'image', content: imageBase64 },
            ])
          : await refineReceipt(items ?? [], text)
      if (applyResult(result)) setCorrection('')
    } catch (refineError) {
      console.error(refineError)
      setError('Não consegui atualizar a proposta. Tente novamente.')
    } finally {
      setIsProposing(false)
    }
  }

  const handleConfirm = async () => {
    if (!items || items.length === 0 || isCreating) return
    if (items.some((item) => item.categoryId == null)) return
    setIsCreating(true)
    try {
      // categoryId is guaranteed present here — confirm is blocked while any item
      // is missing a category (see canConfirm / the early return above).
      const payloads: PostTransactionTypeV2[] = items.map((item) => ({
        amount: item.value,
        category_id: item.categoryId as number,
        subcategory_id: item.subcategoryId,
        description: item.description,
        type: item.type ?? 'expense',
        is_recurring: false,
        location: item.location?.trim() || undefined,
        // The scanner returns the receipt's wall-clock time with no offset;
        // the API only accepts RFC3339.
        date: toRFC3339(item.datetime),
      }))

      const results = await Promise.allSettled(
        payloads.map((payload) => addTransactionV2(payload))
      )

      const failed = results.filter((r) => r.status === 'rejected').length
      const created = results.length - failed

      invalidateTransactionQueries(queryClient)

      if (failed === 0) {
        toast.success(
          `${created} transaç${created === 1 ? 'ão criada' : 'ões criadas'} com sucesso.`
        )
        onOpenChange(false)
      } else {
        toast.error(
          `${created} criada(s), ${failed} falhou(aram). Revise e tente novamente.`
        )
      }
    } catch (confirmError) {
      console.error(confirmError)
      toast.error('Erro ao criar as transações.')
    } finally {
      setIsCreating(false)
    }
  }

  const hasItems = !!items && items.length > 0
  const missingCategory = !!items && items.some((item) => item.categoryId == null)
  const canConfirm = hasItems && !missingCategory && !isProposing && !isCreating

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4" />
            Create from receipt
          </DialogTitle>
        </DialogHeader>

        {items === null ? (
          <div className="flex flex-col gap-3.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="max-h-64 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreviewUrl(null)
                  }}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <Upload className="h-6 w-6" />
                <span>Toque para enviar a foto da nota</span>
              </button>
            )}

            {error ? (
              <p className="flex items-center gap-1.5 text-[12.5px] text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={handleScan}
              disabled={!file || isProposing}
              className="h-9 w-full rounded-[7px] text-[13px] font-semibold"
            >
              {isProposing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Lendo a nota...
                </>
              ) : (
                'Ler nota'
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clarification ? (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-2.5 text-[12.5px] text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{clarification}</span>
              </div>
            ) : null}

            <p className="text-[13px] font-semibold">Criarei essas transações:</p>

            {hasItems ? (
              <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
                {items.map((item, index) => {
                  const categoryName =
                    item.categoryId != null
                      ? categoriesById.get(item.categoryId)
                      : undefined
                  const subcategoryName =
                    item.subcategoryId != null
                      ? subcategoriesById.get(item.subcategoryId)
                      : undefined
                  return (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-foreground">
                          {item.description}
                          {item.location ? (
                            <span className="text-muted-foreground">
                              {' '}
                              · {item.location}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            'text-[11px]',
                            categoryName
                              ? 'text-muted-foreground'
                              : 'text-destructive'
                          )}
                        >
                          {categoryName ?? 'Sem categoria — corrija por mensagem'}
                          {subcategoryName ? ` · ${subcategoryName}` : ''}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium tabular-nums">
                        {currency.format(item.value)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">
                Nenhum item ainda. Responda a pergunta acima para eu tentar de novo.
              </p>
            )}

            <div className="flex items-end gap-2">
              <Textarea
                value={correction}
                onChange={(event) => setCorrection(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleCorrection()
                  }
                }}
                rows={1}
                placeholder={
                  clarification
                    ? 'Responda aqui...'
                    : 'Corrija algo, ex: "muda a categoria do café para Lazer"'
                }
                disabled={isProposing || isCreating}
                className="max-h-[120px] min-h-[38px] flex-1 resize-none text-[12.5px]"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleCorrection}
                disabled={!correction.trim() || isProposing || isCreating}
                className="h-9 w-9 shrink-0 rounded-full"
                aria-label="Enviar correção"
              >
                {isProposing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="mt-1 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={reset}
                disabled={isCreating}
                className="h-9 rounded-[7px] text-[12.5px]"
              >
                Trocar foto
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="h-9 flex-1 rounded-[7px] text-[13px] font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  `Confirmar e criar${hasItems ? ` (${items.length})` : ''}`
                )}
              </Button>
            </div>

            {missingCategory ? (
              <p className="text-[11px] text-destructive">
                Alguns itens estão sem categoria. Corrija por mensagem antes de criar.
              </p>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

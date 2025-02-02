import React from 'react'
import { 
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps<T extends Option> {
  options: T[]
  value: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  groupLabel?: string
}

function MultiSelect<T extends Option>({
  options,
  value,
  onChange,
  placeholder = "Select items",
  groupLabel = "Options"
}: MultiSelectProps<T>) {
  const handleSelect = (selectedValue: string) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue])
    }
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove))
  }

  return (
    <div className="max-w-xs space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((selectedValue) => {
            const selectedItem = options.find(item => item.value === selectedValue)
            return (
              <Badge 
                key={selectedValue} 
                variant="secondary" 
                className="flex items-center"
              >
                {selectedItem?.label}
                <button 
                  onClick={() => handleRemove(selectedValue)}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      <Select onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{groupLabel}</SelectLabel>
            {options.map((item) => (
              <SelectItem 
                key={item.value} 
                value={item.value}
                disabled={value.includes(item.value)}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default MultiSelect
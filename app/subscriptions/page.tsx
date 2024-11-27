'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Music, Tv, Cloud, Coffee, Plus, Trash2 } from 'lucide-react'

type Subscription = {
  id: string
  name: string
  amount: number
  icon: any
  color: string
}

const initialSubscriptions: Subscription[] = [
  { id: '1', name: 'Spotify', amount: 9.99, icon: Music, color: 'bg-green-500' },
  { id: '2', name: 'Netflix', amount: 12.99, icon: Tv, color: 'bg-red-500' },
  { id: '3', name: 'iCloud', amount: 2.99, icon: Cloud, color: 'bg-blue-500' },
  { id: '4', name: 'Starbucks', amount: 19.99, icon: Coffee, color: 'bg-green-700' },
]

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [newSubscription, setNewSubscription] = useState({ name: '', amount: '' })
  const [isAdding, setIsAdding] = useState(false)

  const addSubscription = () => {
    if (newSubscription.name && newSubscription.amount) {
      const subscription: Subscription = {
        id: Date.now().toString(),
        name: newSubscription.name,
        amount: parseFloat(newSubscription.amount),
        icon: Coffee, // Default icon
        color: 'bg-gray-500' // Default color
      }
      setSubscriptions([...subscriptions, subscription])
      setNewSubscription({ name: '', amount: '' })
      setIsAdding(false)
    }
  }

  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Subscriptions</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus size={20} className="mr-2" /> Add Subscription
        </Button>
      </div>
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-white shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Add New Subscription</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Subscription name"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newSubscription.amount}
                  onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                />
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button onClick={addSubscription}>Add</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {subscriptions.map((subscription) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-white shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${subscription.color}`}>
                      <subscription.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{subscription.name}</h3>
                      <p className="text-sm text-gray-500">Monthly</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <p className="font-bold text-lg">${subscription.amount.toFixed(2)}</p>
                    <Switch />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSubscription(subscription.id)}
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}


import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Settings</h1>
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Your email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Input id="currency" placeholder="USD" />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </Card>
    </div>
  )
}


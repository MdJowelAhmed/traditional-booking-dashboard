import { useState } from 'react'
import { Info, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

const defaultAbout = `<h1>About Us</h1>
<p><em>Last updated: January 2024</em></p>

<h2>Our mission</h2>
<p>We connect hosts, businesses, and travelers through a reliable booking platform built for clarity, trust, and growth.</p>

<h2>What we do</h2>
<p>Traditional Booking provides tools to manage listings, bookings, subscriptions, and customer relationships in one place—so you can focus on service, not spreadsheets.</p>

<h2>Our values</h2>
<ul>
  <li><strong>Transparency:</strong> Clear terms, pricing, and communication</li>
  <li><strong>Security:</strong> We take data protection seriously</li>
  <li><strong>Support:</strong> We are here when you need help</li>
</ul>

<h2>Contact</h2>
<p>Questions about the platform? Reach us at <a href="mailto:support@example.com">support@example.com</a>.</p>`

export default function AboutUsSettings() {
  const { user } = useAppSelector((state) => state.auth)
  const canManage = user?.role === UserRole.HOST

  const [about, setAbout] = useState(defaultAbout)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const handleSave = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast({
      title: 'About Us updated',
      description: 'The About Us page has been updated successfully.',
    })
    setIsSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>About Us</CardTitle>
                <CardDescription>
                  {canManage
                    ? "Manage your platform's About Us content"
                    : 'Read-only preview of the About Us content'}
                </CardDescription>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  isLoading={isSubmitting}
                  className="bg-primary text-white hover:bg-primary/80"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {canManage ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="edit" className="gap-2">
                  <Info className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-0">
                <TiptapEditor
                  content={about}
                  onChange={setAbout}
                  placeholder="Write your About Us content here..."
                  className="min-h-[500px]"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: about }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: about }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

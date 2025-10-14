"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react"

interface FormSubmission {
  id: string
  formType: 'contact' | 'feedback' | 'support' | 'partner'
  user: {
    name: string
    email: string
    phone: string
  }
  subject: string
  message: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  assignedTo?: string
  lastUpdated: string
}

export default function FormsManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const [forms, setForms] = useState<FormSubmission[]>([
    {
      id: "FORM-001",
      formType: "contact",
      user: {
        name: "Alice Brown",
        email: "alice@example.com",
        phone: "+94123456786"
      },
      subject: "Inquiry about rental services",
      message: "I would like to know more about your long-term rental options...",
      status: "new",
      priority: "medium",
      createdAt: "2024-01-10T14:30:00Z",
      lastUpdated: "2024-01-10T14:30:00Z"
    },
    {
      id: "FORM-002",
      formType: "feedback",
      user: {
        name: "Bob Wilson",
        email: "bob@example.com",
        phone: "+94123456785"
      },
      subject: "Great service experience",
      message: "The ride was comfortable and the driver was very professional...",
      status: "resolved",
      priority: "low",
      createdAt: "2024-01-09T11:20:00Z",
      lastUpdated: "2024-01-10T09:15:00Z"
    },
    {
      id: "FORM-003",
      formType: "support",
      user: {
        name: "Carol Davis",
        email: "carol@example.com",
        phone: "+94123456784"
      },
      subject: "URGENT: Payment issue",
      message: "I was charged twice for my ride yesterday...",
      status: "in-progress",
      priority: "urgent",
      createdAt: "2024-01-10T16:45:00Z",
      assignedTo: "Support Team",
      lastUpdated: "2024-01-10T17:30:00Z"
    }
  ])

  const filteredForms = forms.filter(form => {
    const matchesSearch = 
      form.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    const matchesType = typeFilter === "all" || form.formType === typeFilter
    const matchesPriority = priorityFilter === "all" || form.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusBadge = (status: FormSubmission['status']) => {
    const variants = {
      new: "bg-blue-100 text-blue-800",
      'in-progress': "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    }
    
    return (
      <Badge className={variants[status]}>
        {status.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: FormSubmission['priority']) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: FormSubmission['formType']) => {
    const variants = {
      contact: "bg-purple-100 text-purple-800",
      feedback: "bg-green-100 text-green-800",
      support: "bg-red-100 text-red-800",
      partner: "bg-orange-100 text-orange-800"
    }
    
    return (
      <Badge className={variants[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId))
  }

  const handleStatusUpdate = (formId: string, newStatus: FormSubmission['status']) => {
    setForms(prev => 
      prev.map(form => 
        form.id === formId ? { 
          ...form, 
          status: newStatus,
          lastUpdated: new Date().toISOString()
        } : form
      )
    )
  }

  const StatsCard = ({ title, value, description, color }: any) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Submissions"
          value={forms.length}
          description="All form submissions"
          color="text-blue-600"
        />
        <StatsCard
          title="New Forms"
          value={forms.filter(f => f.status === 'new').length}
          description="Require attention"
          color="text-yellow-600"
        />
        <StatsCard
          title="In Progress"
          value={forms.filter(f => f.status === 'in-progress').length}
          description="Being handled"
          color="text-orange-600"
        />
        <StatsCard
          title="Urgent Priority"
          value={forms.filter(f => f.priority === 'urgent').length}
          description="Immediate action needed"
          color="text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
          <CardDescription>
            Manage contact forms, feedback, and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.id}</TableCell>
                    <TableCell>{getTypeBadge(form.formType)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{form.user.name}</div>
                        <div className="text-sm text-muted-foreground">{form.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={form.subject}>
                        {form.subject}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(form.priority)}</TableCell>
                    <TableCell>{getStatusBadge(form.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteForm(form.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {form.status === 'new' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusUpdate(form.id, 'in-progress')}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredForms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No form submissions found matching your filters.
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredForms.length} of {forms.length} forms
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
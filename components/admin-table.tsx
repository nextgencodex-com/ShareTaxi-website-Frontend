"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

interface Request {
  id: string
  type: 'shared' | 'personal' | 'rental'
  user: {
    name: string
    email: string
    phone: string
  }
  pickup: string
  destination: string
  date: string
  time: string
  passengers: number
  handCarry: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  vehicleType?: string
  duration?: string
  specialRequests?: string
}

export default function AdminRequestsDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Mock data - replace with actual API calls
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "REQ-001",
      type: "shared",
      user: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+94123456789"
      },
      pickup: "Colombo Fort",
      destination: "Kandy",
      date: "2024-01-15",
      time: "08:00 AM",
      passengers: 2,
      handCarry: 1,
      status: "pending",
      createdAt: "2024-01-10T10:00:00Z"
    },
    {
      id: "REQ-002",
      type: "personal",
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+94123456788"
      },
      pickup: "Negombo",
      destination: "Colombo Airport",
      date: "2024-01-16",
      time: "06:00 AM",
      passengers: 3,
      handCarry: 2,
      status: "approved",
      createdAt: "2024-01-10T09:30:00Z",
      vehicleType: "Sedan"
    },
    {
      id: "REQ-003",
      type: "rental",
      user: {
        name: "Mike Johnson",
        email: "mike@example.com",
        phone: "+94123456787"
      },
      pickup: "Galle",
      destination: "Mirissa",
      date: "2024-01-17",
      time: "09:00 AM",
      passengers: 4,
      handCarry: 3,
      status: "completed",
      createdAt: "2024-01-09T14:20:00Z",
      duration: "8 hours",
      vehicleType: "SUV"
    }
  ])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Request['status']) => {
    const variants = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle }
    }
    
    const { color, icon: Icon } = variants[status]
    return (
      <Badge className={`${color} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: Request['type']) => {
    const variants = {
      shared: "bg-purple-100 text-purple-800",
      personal: "bg-orange-100 text-orange-800",
      rental: "bg-cyan-100 text-cyan-800"
    }
    
    return (
      <Badge className={variants[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const handleStatusUpdate = (requestId: string, newStatus: Request['status']) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    )
  }

  const StatsCard = ({ title, value, description, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={requests.length}
          description="All time requests"
          icon={Clock}
          color="text-blue-500"
        />
        <StatsCard
          title="Pending"
          value={requests.filter(r => r.status === 'pending').length}
          description="Awaiting approval"
          icon={Clock}
          color="text-yellow-500"
        />
        <StatsCard
          title="Approved"
          value={requests.filter(r => r.status === 'approved').length}
          description="Confirmed requests"
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatsCard
          title="Completed"
          value={requests.filter(r => r.status === 'completed').length}
          description="Finished rides"
          icon={CheckCircle}
          color="text-blue-500"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Request Management</CardTitle>
          <CardDescription>
            Manage and review all ride requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{getTypeBadge(request.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user.name}</div>
                        <div className="text-sm text-muted-foreground">{request.user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.pickup}</div>
                        <div className="text-sm text-muted-foreground">→ {request.destination}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{request.date}</div>
                        <div className="text-sm text-muted-foreground">{request.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>👤 {request.passengers}</div>
                        <div className="text-sm text-muted-foreground">🎒 {request.handCarry}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No requests found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
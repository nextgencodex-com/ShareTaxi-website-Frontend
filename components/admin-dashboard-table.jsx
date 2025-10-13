// components/admin/bookings-management-tab.tsx
import { useState } from 'react';
import { useAdminBookings } from '@/hooks/use-admin-bookings';
import { BookingDetailsView } from '@/components/admin/booking-details-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CheckCircle, Trash2 } from 'lucide-react';

export function BookingsManagementTab() {
  const {
    bookings,
    loading,
    selectedBooking,
    setSelectedBooking,
    confirmBooking,
    deleteBooking,
  } = useAdminBookings();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleConfirm = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      try {
        await confirmBooking(bookingId);
      } catch (error) {
        console.error('Failed to confirm booking:', error);
      }
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shared':
        return 'bg-purple-100 text-purple-800';
      case 'vehicle':
        return 'bg-orange-100 text-orange-800';
      case 'personal':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading bookings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Bookings Management ({bookings.length} total, {filteredBookings.length} shown)
          </CardTitle>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by customer name, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="shared">Shared Rides</SelectItem>
                <SelectItem value="vehicle">Vehicle Bookings</SelectItem>
                <SelectItem value="personal">Personal Rides</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {bookings.length === 0 ? (
                <div>
                  <p className="text-lg mb-2">No bookings found</p>
                  <p className="text-sm">
                    Bookings will appear here when customers make reservations.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-2">No bookings match your search</p>
                  <p className="text-sm">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Booking Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800">
                            {booking.customer.name}
                          </h3>
                          <p className="text-gray-600">Booking ID: {booking.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(booking.type)}>
                            {booking.type.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Route Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Pickup</label>
                          <p className="font-semibold">{booking.route.pickup.location}</p>
                          <p className="text-sm text-gray-500">
                            {booking.route.pickup.date} at {booking.route.pickup.time}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Destination
                          </label>
                          <p className="font-semibold">
                            {booking.route.destination.location}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.route.destination.date} at {booking.route.destination.time}
                          </p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>👥 {booking.details.passengers} passengers</span>
                        <span>🧳 {booking.details.luggage} luggage</span>
                        <span>👜 {booking.details.handCarry} hand carry</span>
                        <span>
                          💰 {booking.payment.currency} {booking.payment.amount}
                        </span>
                        <span>📅 {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>

                      {booking.status === 'pending' && (
                        <Button
                          size="sm"
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => handleConfirm(booking.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(booking.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {bookings.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">📊 Booking Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">{bookings.length}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-yellow-600">
                    {bookings.filter((b) => b.status === 'pending').length}
                  </div>
                  <div className="text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </div>
                  <div className="text-gray-600">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-purple-600">
                    {bookings.filter((b) => b.type === 'shared').length}
                  </div>
                  <div className="text-gray-600">Shared</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-orange-600">
                    {bookings.filter((b) => b.type === 'vehicle').length}
                  </div>
                  <div className="text-gray-600">Vehicle</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-cyan-600">
                    {bookings.filter((b) => b.type === 'personal').length}
                  </div>
                  <div className="text-gray-600">Personal</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsView
          booking={selectedBooking}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </>
  );
}

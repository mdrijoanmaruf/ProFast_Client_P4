import React, { useState } from 'react';
import useAxiosSecure from '../../Hook/useAxiosSecure';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaBox,
  FaFileAlt,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaHome,
  FaExclamationTriangle,
  FaShippingFast
} from 'react-icons/fa';

const PublicTracking = () => {
  const axiosSecure = useAxiosSecure();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedParcel, setSearchedParcel] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'paid': 'text-blue-600 bg-blue-100',
      'processing': 'text-purple-600 bg-purple-100',
      'shipped': 'text-indigo-600 bg-indigo-100',
      'in-transit': 'text-orange-600 bg-orange-100',
      'out-for-delivery': 'text-cyan-600 bg-cyan-100',
      'delivered': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <FaClock className="text-yellow-600" />,
      'paid': <FaCheckCircle className="text-blue-600" />,
      'processing': <FaBox className="text-purple-600" />,
      'shipped': <FaShippingFast className="text-indigo-600" />,
      'in-transit': <FaTruck className="text-orange-600" />,
      'out-for-delivery': <FaTruck className="text-cyan-600" />,
      'delivered': <FaCheckCircle className="text-green-600" />,
      'cancelled': <FaExclamationTriangle className="text-red-600" />
    };
    return icons[status] || <FaClock className="text-gray-600" />;
  };

  const trackingSteps = [
    { id: 'pending', label: 'Order Placed', description: 'Your parcel booking has been received' },
    { id: 'paid', label: 'Payment Confirmed', description: 'Payment has been processed successfully' },
    { id: 'processing', label: 'Processing', description: 'Your parcel is being prepared for shipment' },
    { id: 'shipped', label: 'Shipped', description: 'Your parcel has been picked up and is in our facility' },
    { id: 'in-transit', label: 'In Transit', description: 'Your parcel is on its way to destination' },
    { id: 'out-for-delivery', label: 'Out for Delivery', description: 'Your parcel is out for final delivery' },
    { id: 'delivered', label: 'Delivered', description: 'Your parcel has been successfully delivered' }
  ];

  const getCurrentStepIndex = (status) => {
    return trackingSteps.findIndex(step => step.id === status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTrackingSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setSearchError('Please enter a tracking number');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchedParcel(null);

    try {
      // Try to find by tracking number using the dedicated endpoint
      try {
        const trackingRes = await axiosSecure.get(`/parcels/track/${trackingNumber.trim()}`);
        if (trackingRes.data.success) {
          setSearchedParcel(trackingRes.data.data);
          return;
        }
      } catch (trackingError) {
        // If tracking endpoint fails, try other methods
      }

      // Fallback: Try to find by parcel ID
      try {
        const parcelRes = await axiosSecure.get(`/parcels/${trackingNumber.trim()}`);
        setSearchedParcel(parcelRes.data);
      } catch (error) {
        setSearchError('Parcel not found. Please check your tracking number and try again.');
      }
    } catch (error) {
      console.error('Tracking search error:', error);
      setSearchError('Unable to search for parcel. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const TrackingProgress = ({ parcel }) => {
    const currentStepIndex = getCurrentStepIndex(parcel.status);
    
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Tracking Progress</h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
          <div 
            className="absolute left-6 top-8 w-0.5 bg-[#03373D] transition-all duration-500"
            style={{ height: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }}
          ></div>
          
          {/* Steps */}
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="relative flex items-start">
                  {/* Step Circle */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-[#03373D] border-[#03373D] text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <FaCheckCircle className="w-6 h-6" />
                    ) : (
                      <FaClock className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-6 flex-1">
                    <div className={`font-medium ${isCompleted ? 'text-[#03373D]' : 'text-gray-500'}`}>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#CAEB66] text-[#03373D]">
                          Current
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-1 ${isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                      {step.description}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {formatDate(parcel.updatedAt || parcel.creation_date)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#03373D] mb-4">Track Your Parcel</h1>
          <p className="text-gray-600 text-lg">Enter your tracking number to get real-time updates</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleTrackingSearch} className="mb-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., PRO1641234567890)"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAEB66] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#03373D] text-white px-8 py-3 rounded-lg hover:bg-[#044a52] focus:outline-none focus:ring-2 focus:ring-[#CAEB66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSearch className="w-5 h-5 inline mr-2" />
                    Track
                  </>
                )}
              </button>
            </div>
          </form>

          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600">{searchError}</p>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {searchedParcel && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#03373D] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {searchedParcel.type === 'document' ? (
                    <FaFileAlt className="text-[#CAEB66] text-2xl" />
                  ) : (
                    <FaBox className="text-[#CAEB66] text-2xl" />
                  )}
                  <div>
                    <h2 className="text-white text-xl font-semibold">{searchedParcel.title}</h2>
                    <p className="text-[#CAEB66]">Tracking: {searchedParcel.trackingNumber}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(searchedParcel.status)}`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(searchedParcel.status)}
                    <span className="capitalize">{searchedParcel.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <TrackingProgress parcel={searchedParcel} />

              {/* Parcel Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Pickup Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Pickup Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><FaUser className="inline mr-2 text-blue-600" /><strong>Name:</strong> {searchedParcel.senderName}</p>
                    <p><FaPhone className="inline mr-2 text-blue-600" /><strong>Contact:</strong> {searchedParcel.senderContact}</p>
                    <p><FaMapMarkerAlt className="inline mr-2 text-blue-600" /><strong>Location:</strong> {searchedParcel.senderRegion} - {searchedParcel.senderServiceCenter}</p>
                    <p><FaHome className="inline mr-2 text-blue-600" /><strong>Address:</strong> {searchedParcel.senderAddress}</p>
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <FaTruck className="mr-2" />
                    Delivery Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><FaUser className="inline mr-2 text-green-600" /><strong>Name:</strong> {searchedParcel.receiverName}</p>
                    <p><FaPhone className="inline mr-2 text-green-600" /><strong>Contact:</strong> {searchedParcel.receiverContact}</p>
                    <p><FaMapMarkerAlt className="inline mr-2 text-green-600" /><strong>Location:</strong> {searchedParcel.receiverRegion} - {searchedParcel.receiverServiceCenter}</p>
                    <p><FaHome className="inline mr-2 text-green-600" /><strong>Address:</strong> {searchedParcel.receiverAddress}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Booking Date</p>
                  <p className="font-semibold flex items-center justify-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    {formatDate(searchedParcel.creation_date)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Delivery Cost</p>
                  <p className="font-semibold text-[#03373D] text-lg">৳{searchedParcel.cost}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Package Type</p>
                  <p className="font-semibold capitalize">
                    {searchedParcel.type === 'document' ? '📄 Document' : '📦 Non-Document'}
                    {searchedParcel.weight && ` (${searchedParcel.weight}kg)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Need Help?</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Tracking numbers are usually in the format: PRO1234567890123</p>
            <p>• You can also use your parcel ID for tracking</p>
            <p>• Updates may take a few minutes to reflect in the system</p>
            <p>• For assistance, contact our support team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTracking;

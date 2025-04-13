import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GuestCitySelection from './pages/GuestCitySelection';
import GuestRoomBooking from './pages/GuestRoomBooking';
import GuestRestaurantOrders from './pages/GuestRestaurantOrders';
import GuestHotelFacilities from './pages/GuestHotelFacilities';
import GuestCheckout from './pages/GuestCheckout';
import BranchStaffDashboard from './pages/BranchStaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CitySelectionPage from './pages/CitySelectionPage';
import RoomBookingPage from './pages/RoomBookingPage';
import RestaurantOrdersPage from './pages/RestaurantOrdersPage';
import HotelFacilitiesPage from './pages/HotelFacilitiesPage';
import CheckoutPage from './pages/CheckoutPage';
import FloorPlanPage from './pages/FloorPlanPage';
import BranchSelectionPage from './pages/BranchSelectionPage';
import StatisticsPage from './pages/StatisticsPage';
import GuestDashboard from './pages/GuestDashboard';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/guest/city-selection" element={<GuestCitySelection />} />
                <Route path="/guest/room-booking" element={<GuestRoomBooking />} />
                <Route path="/guest/restaurant-orders" element={<GuestRestaurantOrders />} />
                <Route path="/guest/hotel-facilities" element={<GuestHotelFacilities />} />
                <Route path="/guest/checkout" element={<GuestCheckout />} />
                <Route path="/branch-staff-dashboard" element={<BranchStaffDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/city-selection" element={<CitySelectionPage />} />
                <Route path="/room-booking" element={<RoomBookingPage />} />
                <Route path="/restaurant-orders" element={<RestaurantOrdersPage />} />
                <Route path="/hotel-facilities" element={<HotelFacilitiesPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/floor-plan" element={<FloorPlanPage />} />
                <Route path="/branch-selection" element={<BranchSelectionPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/guest-dashboard" element={<GuestDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../../context/LocationContext.jsx";

export const useNavbar = () => {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { location, setLocation } = useLocation();

    
    const openDrawer = useCallback(() => {
        setDrawerOpen(true);
    }, [])
    
    const closeDrawer = useCallback(()=> {
        setDrawerOpen(false);
    }, []);
    
    const handleLocationChange = useCallback((data) => {
        if (data?.lat === undefined || data?.lng === undefined) {
            return;
        }

        setLocation({
            address: data.address,
            latitude: data.lat,
            longitude: data.lng
        });
    }, [setLocation]);

    const handleSearchChange = useCallback((event)=> {
        setSearchQuery(event.target.value);
    }, [])
    
const handleSearch = useCallback(() => {
    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/services?search=${encodeURIComponent(query)}`);
}, [searchQuery, navigate]);

    return {
        drawerOpen, 
        location: location.address,
        searchQuery,

        openDrawer,
        closeDrawer,

        handleLocationChange,
        handleSearchChange,
        handleSearch
    };
};
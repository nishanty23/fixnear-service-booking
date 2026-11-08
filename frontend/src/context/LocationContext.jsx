import { createContext, useContext, useMemo, useState } from "react";

const defaultLocation = {
    address: "Kharghar, Navi Mumbai, Maharashtra",
    latitude: 19.0473,
    longitude: 73.0699
};

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(defaultLocation);

    const value = useMemo(
        () => ({ location, setLocation }),
        [location]
    );

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);

    if (!context) {
        throw new Error("useLocation must be used inside LocationProvider");
    }

    return context;
}

import { useEffect, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
});

export const useLocationAutocomplete = (location, onLocationSelect) => {
  const [inputValue, setInputValue] = useState(location || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue(location || "");
  }, [location]);

  useEffect(() => {
    if (inputValue.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const { AutocompleteSuggestion } = await importLibrary("places");

        const { suggestions: results } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: inputValue,
            includedRegionCodes: ["in"],
          });

        if (active) {
          setSuggestions(
            results
              .filter((item) => item.placePrediction)
              .map((item) => item.placePrediction),
          );
        }
      } catch (error) {
        console.error("Places API error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleSelect = async (prediction) => {
    try {
      const place = prediction.toPlace();

      await place.fetchFields({
        fields: ["formattedAddress", "location"],
      });

      if (!place.location) {
        return;
      }

      const selectedLocation = {
        address: place.formattedAddress,
        lat: place.location.lat(),
        lng: place.location.lng(),
      };

      setInputValue(selectedLocation.address);
      setSuggestions([]);
      onLocationSelect(selectedLocation);
    } catch (error) {
      console.error("Location selection failed:", error);
    }
  };

  return {
    inputValue,
    setInputValue,
    suggestions,
    loading,
    handleSelect,
  };
};

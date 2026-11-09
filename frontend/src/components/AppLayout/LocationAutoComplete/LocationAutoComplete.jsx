import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import { useLocationAutocomplete } from "./useLocationAutocomplete";
import { memo, useState } from "react";

const LocationAutocomplete = memo(({ location, onLocationSelect }) => {
  const { inputValue, setInputValue, suggestions, loading, handleSelect } = useLocationAutocomplete(location, onLocationSelect);

  const [isFocused, setFocus] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex h-[52px] items-center gap-3 rounded-[10px] border border-neutral-200 px-[18px] focus-within:border-neutral-900 lg:h-[60px]">
        <LocationOnOutlinedIcon className="shrink-0 text-neutral-500" />

        <InputBase
          id="navbar-location-input"
          fullWidth
          value={inputValue}
          placeholder="Enter your location"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(event) => setInputValue(event.target.value)}
          inputProps={{ "aria-label": "Search location" }}
          className="text-base lg:text-lg"
        />

        {loading && <CircularProgress size={18} />}
      </div>

      {isFocused && suggestions.length > 0 && (
        <Paper
          elevation={4}
          className="absolute left-0 top-full z-[1500] mt-2 max-h-72 w-full overflow-y-auto rounded-xl"
        >
          {suggestions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(prediction)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-100"
            >
              <LocationOnOutlinedIcon
                fontSize="small"
                className="text-neutral-400"
              />

              {prediction.text.toString()}
            </button>
          ))}
        </Paper>
      )}
    </div>
  );
});

export default LocationAutocomplete;

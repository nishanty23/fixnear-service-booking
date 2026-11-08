import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Link from "@mui/material/Link";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { memo } from "react";

import { useNavbar } from "./NavBar";
import AppDrawer from "../AppDrawer/AppDrawer";
import LocationAutocomplete from "../LocationAutoComplete/LocationAutoComplete";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#" },
  { label: "Become a Provider", href: "#" },
];

const Navbar = memo(() => {
  const {
    drawerOpen,
    location,
    searchQuery,
    openDrawer,
    closeDrawer,
    handleLocationChange,
    handleSearchChange,
    handleSearch,
  } = useNavbar();

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        className="border-b border-neutral-200 bg-white text-neutral-900"
      >
        <Toolbar
          disableGutters
          className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:h-20 md:flex-nowrap md:px-6 md:py-0 lg:h-[104px] lg:gap-6"
        >
          {/* Brand */}
          <Link
            href="/"
            underline="none"
            color="inherit"
            aria-label="FixNear home"
            className="whitespace-nowrap text-2xl font-extrabold leading-none tracking-tight lg:text-[28px]"
          >
            <span className="text-[34px] font-extrabold leading-none tracking-tight text-slate-900">
              Fix<span className="text-[#247c4b]">Near</span>
            </span>
          </Link>

          {/* Text links (hidden below lg) */}
          <nav
            aria-label="Primary"
            className="ml-2 hidden items-center gap-2 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                underline="none"
                color="inherit"
                className="whitespace-nowrap rounded-lg px-4 py-2 text-lg text-neutral-700 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="order-1 flex-1 md:order-none" />

          {/* Location */}
          <div className="order-3 w-full md:order-none md:w-60 xl:w-80">
              <LocationAutocomplete
                  location={location}
                  onLocationSelect={handleLocationChange}
              />
          </div>

          {/* Search */}
          <div className="order-4 flex h-[52px] w-full items-center gap-3 rounded-[10px] border border-neutral-200 px-[18px] text-neutral-700 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2 md:order-none md:w-64 lg:h-[60px] xl:w-[335px]">
            <SearchIcon />
            <InputBase
              fullWidth
              placeholder="Search for ‘Kitchen cleaning’"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              inputProps={{ "aria-label": "Search services" }}
              className="text-base lg:text-lg"
            />
          </div>

          {/* profile */}
          <div className="order-2 flex items-center gap-3 md:order-none md:ml-4 md:gap-6">
            <IconButton
              aria-label="Account Menu"
              color="inherit"
              onClick={openDrawer}
              className="h-10 w-10 p-0"
            >
              <AccountCircleOutlinedIcon fontSize="large" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <AppDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
});

export default Navbar;

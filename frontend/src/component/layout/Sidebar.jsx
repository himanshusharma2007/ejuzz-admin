import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Person, Assignment, People, CalendarMonth, PermContactCalendar, QueryStats } from '@mui/icons-material';

const Sidebar = () => {
  const sidebarItems = [
    { label: 'Dashboard', icon: <Dashboard />, link: '/' },
    { label: 'Profile', icon: <Person />, link: '/profile' },
    { label: 'To-Do', icon: <Assignment />, link: '/to-do' },
    { label: 'Leads', icon: <PermContactCalendar />, link: '/leads' },
    { label: 'Projects', icon: <Assignment />, link: '/projects' },
    { label: 'Teams', icon: <People />, link: '/teams' },
    { label: 'Meetings', icon: <CalendarMonth />, link: '/meetings' },
    { label: 'Connection', icon: <QueryStats />, link: '/connection' },
    { label: 'User Verification', icon: <PermContactCalendar />, link: '/user-verification' },
    { label: 'Query', icon: <QueryStats />, link: '/query' },
  ];

  return (
    <Box
      component="nav"
      sx={{
        width: '250px',
        flexShrink: 0,
        '& .MuiListItemButton-root': {
          px: 3,
          py: 1.5,
          borderRadius: 1,
          '&.active': {
            bgcolor: 'primary.main',
            color: 'white',
          },
        },
      }}
    >
      <List>
        {sidebarItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <NavLink to={item.link} className="w-full">
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </NavLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
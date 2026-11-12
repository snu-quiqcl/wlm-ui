import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import LogoutIcon from '@mui/icons-material/Logout';

import { AppDispatch } from '../../../../store';
import { signout, selectUser } from '../../../../store/slices/user/user';

const APP_NAME = 'WLM Laser Control';

const AppNavBar = () => {
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(menuAnchorEl);
    const userState = useSelector(selectUser);
    const dispatch = useDispatch<AppDispatch>();

    const onClickSignout = async () => {
        dispatch(signout());
    };

    return (
        <AppBar
            position='sticky'
            sx={{
                paddingY: 0.5,
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
            }}
        >
            <Toolbar
                sx={{ justifyContent: 'space-between' }}
            >
                <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                        component='img'
                        src={'/logo192.png'}
                        alt='Logo'
                        sx={{
                            height: 32,
                            width: 32,
                        }}
                    />
                    <Typography
                        component='h1'
                        variant='h5'
                        sx={{ fontWeight: 'bold', color: 'text.primary' }}
                    >
                        {APP_NAME}
                    </Typography>
                </Stack>
                <IconButton
                    onClick={e => setMenuAnchorEl(e.currentTarget)}
                >
                    <Avatar>{userState.user!.username[0]}</Avatar>
                </IconButton>
                <Menu
                    anchorEl={menuAnchorEl}
                    open={isMenuOpen}
                    onClose={() => setMenuAnchorEl(null)}
                >
                    <MenuList
                        sx={{ padding: 0 }}
                    >
                        <MenuItem onClick={onClickSignout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize='small' />
                            </ListItemIcon>
                            Sign out
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default AppNavBar;

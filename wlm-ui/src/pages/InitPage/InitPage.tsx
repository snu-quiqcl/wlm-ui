import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';

import { AppDispatch } from '../../store';
import { signin } from '../../store/slices/user/user';

const Container = styled(Stack)(() => ({
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
}));

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const InitPage = () => {
    const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();

    const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const username = document.getElementById('username') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        let isValid = true;

        if (!username.value) {
            setUsernameErrorMessage('Please enter a valid username.');
            isValid = false;
        } else {
            setUsernameErrorMessage('');
        }

        if (!password.value) {
            setPasswordErrorMessage('Please enter a valid password.');
            isValid = false;
        } else {
            setPasswordErrorMessage('');
        }

        if (isValid) {
            const data = { username: username.value, password: password.value };
            dispatch(signin(data))
        }
    };

    return (
        <Container>
            <Card variant='outlined'>
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ alignSelf: 'flex-start', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign in
                </Typography>
                <Box
                    component='form'
                    noValidate
                    onSubmit={handleSignin}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <TextField
                            id='username'
                            label='Username'
                            placeholder='QuIQCL'
                            variant='standard'
                            autoFocus
                            fullWidth
                            error={!!usernameErrorMessage}
                            helperText={usernameErrorMessage}
                        />
                    </FormControl>
                    <FormControl variant='standard'>
                        <TextField
                            id='password'
                            label='Password'
                            placeholder='******'
                            variant='standard'
                            type='password'
                            autoFocus
                            fullWidth
                            error={!!passwordErrorMessage}
                            helperText={passwordErrorMessage}
                        />
                    </FormControl>
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                    >
                        Sign in
                    </Button>
                </Box>
            </Card>
        </Container>
    );
};

export default InitPage;

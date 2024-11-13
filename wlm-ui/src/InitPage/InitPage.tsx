import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { signin } from '../store/slices/user/user';

const InitPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const onClickSignin = async () => {
        if (username !== '' && password !== '') {
            const data = { username: username, password: password };
            dispatch(signin(data))
                .unwrap()
                .then(() => {
                    navigate('/');
                })
                .catch(() => {});
        }
    };

    return (
        <div>
            <input
                type='text'
                placeholder='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type='password'
                placeholder='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={onClickSignin}
            >
                Sign in
            </button>
        </div>
    );
};

export default InitPage;

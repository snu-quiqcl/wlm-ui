import { useState } from 'react';

const InitPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const onClickSignin = async () => {
        if (username !== '' && password !== '') {
            const data = { username: username, password: password };
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

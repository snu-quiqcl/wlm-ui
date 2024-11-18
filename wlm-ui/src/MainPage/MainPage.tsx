import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { signout } from '../store/slices/user/user';

const MainPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const onClickSignout = async () => {
        dispatch(signout());
    };

    return (
        <div>
            <button
                onClick={onClickSignout}
            >
                Sign out
            </button>
        </div>
    );
};

export default MainPage;

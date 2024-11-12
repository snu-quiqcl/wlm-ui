import { useState } from "react";

const InitPage = () => {
    const [username, setUsername] = useState<string>('')
    return (
        <div>
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
        </div>
    );
};

export default InitPage;

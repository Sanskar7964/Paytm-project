import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export const Users = ({ updateBalance }) => {
    const { filter: initialFilter } = useParams();
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState(initialFilter || "");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/user/bulk?filter=${encodeURIComponent(filter)}`);
                setUsers(response.data.user);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(fetchData, 300);

        return () => clearTimeout(timeoutId);
    }, [filter]);
    
    const handleSendMoney = (id, name) => {
        navigate(`/send?id=${id}&name=${name}`);
    };

    return (
        <>
            <div className="font-bold mt-6 text-lg">Users</div>
            <div className="my-2">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-2 py-1 border rounded border-slate-200"
                />
            </div>
            <div>
                {users.map(user => (
                    <User key={user.id} user={user} onSendMoney={handleSendMoney} />
                ))}
            </div>
        </>
    );
};

function User({ user, onSendMoney }) {
    return (
        <div className="flex justify-between">
            <div className="flex">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {user.firstName[0]}
                    </div>
                </div>
                <div className="flex flex-col justify-center h-full">
                    <div>{user.firstName} {user.lastName}</div>
                </div>
            </div>

            <div className="flex flex-col justify-center h-full">
                <Button
                    onClick={() => onSendMoney(user.id, `${user.firstName} ${user.lastName}`)}
                    label="Send Money"
                />
            </div>
        </div>
    );
}

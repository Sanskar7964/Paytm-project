import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export const Dashboard = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Error fetching balance:", error);
            if (error.response && error.response.status === 403) {
                navigate("/signin");
            }
        }
    };

    return (
        <div>
            <Appbar />
            <div className="m-8">
                <Balance value={balance !== null ? balance.toFixed(2) : "Loading..."} />
                <Users />
            </div>
        </div>
    );
};

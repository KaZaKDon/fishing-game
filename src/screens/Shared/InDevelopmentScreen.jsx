import { useNavigate } from "react-router-dom";

export default function InDevelopmentScreen({ title }) {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: 100 }}>
            <h1>{title}</h1>
            <p>В разработке</p>

            <button onClick={() => navigate("/base")}>
                Назад
            </button>
        </div>
    );
}
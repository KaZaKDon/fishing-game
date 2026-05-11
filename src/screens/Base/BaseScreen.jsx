import { useNavigate } from "react-router-dom";
import "./BaseScreen.css";

const baseItems = [
    {
        id: "map",
        title: "Карта",
        route: "/regions",
        image: "/images/base/berth.png",
        className: "base-object--berth",
    },
    {
        id: "gear",
        title: "Снасти",
        route: "/gear",
        image: "/images/base/tackle.png",
        className: "base-object--tackle",
    },
    {
        id: "catch",
        title: "Улов",
        route: "/catch",
        image: "/images/base/cage.png",
        className: "base-object--cage",
    },
    {
        id: "shop",
        title: "Магазин",
        route: "/shop",
        image: "/images/base/shop.png",
        className: "base-object--shop",
    },
    {
        id: "quests",
        title: "Квесты",
        route: "/quests",
        image: "/images/base/quest.png",
        className: "base-object--quest",
    },
    {
        id: "account",
        title: "Аккаунт",
        route: "/account",
        image: "/images/base/tent.png",
        className: "base-object--tent",
    },
];

export default function BaseScreen() {
    const navigate = useNavigate();

    return (
        <main className="base-screen">
            <img
                className="base-screen__bg"
                src="/images/base/fon-baza.jpg"
                alt=""
            />

            <div className="base-screen__objects">
                {baseItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`base-object ${item.className}`}
                        onClick={() => navigate(item.route)}
                        aria-label={item.title}
                    >
                        <img src={item.image} alt="" draggable="false" />
                        <span className="base-object__tooltip">{item.title}</span>
                    </button>
                ))}
            </div>
        </main>
    );
}
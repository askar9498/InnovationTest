import {
    ChartsWidget1, ChartsWidget3,
    MixedWidget10,
    TablesWidget1,
    TablesWidget2,
    TablesWidget3, TablesWidget4,
    TablesWidget5, TablesWidget6, TablesWidget7, TablesWidget8,
    TablesWidget9
} from "../../_metronic/partials/widgets/index.ts";
import { PagingForTables } from "../../_metronic/partials/widgets/tables/Paging.tsx";
import { Campaigns } from "../modules/profile/components/Campaigns.tsx";

const UserDashBoard = () => {
    return (
        <div dir="rtl" style={{ fontFamily: 'sans' }}>
            <h1 className="text-dark fw-bold mb-5">داشبورد کاربر</h1>
            
            <Campaigns />
            <br />

            <div className="flex gap-6">
                <ChartsWidget1 className={"w-50 h-auto"} />
                <ChartsWidget3 className={"w-50 h-auto"} />
            </div>
            <br />
            <MixedWidget10
                chartColor='info'
                chartHeight='150px' 
                className={""}
            />
            <br />
        </div>
    );
}

export default UserDashBoard;


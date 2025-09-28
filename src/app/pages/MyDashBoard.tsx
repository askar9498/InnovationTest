import {
  ChartsWidget1,
  ChartsWidget3,
  MixedWidget10,
  TablesWidget1,
  TablesWidget2,
  TablesWidget3,
  TablesWidget4,
  TablesWidget5,
  TablesWidget6,
  TablesWidget7,
  TablesWidget8,
  TablesWidget9,
} from "../../_metronic/partials/widgets/index.ts";
import { PagingForTables } from "../../_metronic/partials/widgets/tables/Paging.tsx";
import { Campaigns } from "../modules/profile/components/Campaigns.tsx";

const MyDashBoard = () => {
  return (
    <>
      <Campaigns></Campaigns>
      <br />

      <div className="row g-5 g-xl-8" style={{ fontFamily: "sans" }} dir="rtl">
        <div className="col-xl-6">
          <ChartsWidget1 className="h-auto"></ChartsWidget1>
        </div>
        <div className="col-xl-6">
          <ChartsWidget3 className="h-auto"></ChartsWidget3>
        </div>
      </div>
      <br />
      <MixedWidget10 chartColor="info" chartHeight="150px" className="" />
      <br />
    </>
  );
};

export default MyDashBoard;

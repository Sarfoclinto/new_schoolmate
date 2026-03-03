import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);

export default dayjs;
export type Dayjs = dayjs.Dayjs

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export default dayjs;

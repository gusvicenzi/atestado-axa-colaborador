import { addDays, isFriday, isSaturday, isSunday, isThursday, subDays } from "date-fns";


export default function obterDataMinInicio() {
    let minDate = subDays(new Date(), 5);
    // if (isSunday(minDate)) {
    //     minDate = subDays(minDate, 5);
    // } else if (isSaturday(minDate)) {
    //     minDate = subDays(minDate, 4);
    // } else if (isFriday(minDate)) {
    //     minDate = subDays(minDate, 2);
    // } else if (isThursday(minDate)) {
    //     minDate = subDays(minDate, 1);
    // }
    return minDate;
}
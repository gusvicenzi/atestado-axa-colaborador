export default function findSring(str, find) {
    return str?.toLowerCase().indexOf(find.toLowerCase()) > -1 ? true : false;
}
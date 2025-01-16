import { Divider } from "primereact/divider";

export default function ContentDivisor({ icon, content }) {
    return (
        <Divider align='left' className="text-500 flex align-itens-center">
            <i className={`${icon} mr-2`}></i>
            {content}
        </Divider>
    )
}
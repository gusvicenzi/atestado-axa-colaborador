export default function FieldName({ name, required }) {
    return (
        <label
            className='text-700'
        >
            {name}
            {
                required &&
                <span className="text-red-500">*</span>
            }
        </label>
    )
}

const Input = ({ id, name, type = 'text', placeholder, value, onChange, required = false }) => {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="text-sm w-full px-3 py-2 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
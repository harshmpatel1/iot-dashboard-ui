import { useState, useEffect } from "react";
import { url } from "../constants/serverInfo";

const UploadFormModel = ({ closemodel}) => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // <-- Only one selected

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${url}/upload/firm_ware`);
        const result = await response.json();

        setUsers(result.data);
        console.log("Fetched:", result.data);

      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleConfirm = () => {
    if (!selectedId) {
      alert("Please select one firmware!");
      return;
    }

    const selectedData = users.find((u) => u.id === selectedId);
    console.log("Selected Firmware Row:", selectedData);

    // you can pass data back if needed
    closemodel(selectedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[60vw] h-[60%] relative">
        
        <div
          className="absolute right-5 top-5 text-xl cursor-pointer"
          onClick={closemodel}
        >
          x
        </div>

        <h2 className="text-xl font-semibold mb-4">Select Firmware Package</h2>

        {/* Search Box */}
        <div className="flex justify-center items-center border-2 py-2">
          <input
            className="border-r-2 w-[90%] outline-none text-sm"
            placeholder="Search..."
          />
          <svg
            className="ml-2 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            color="currentColor"
            fill="none"
          >
            <path
              d="M17 17L21 21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>

        <p className="text-sm p-2 text-blue-400">
          Total Number of options: {users.length}
        </p>

        <hr />

        {/* Table */}
        <div className="overflow-scroll scrollbar-hide shadow-md rounded-xl h-[50%]">
          <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            className="text-center min-w-full mt-2"
          >
            <thead className="bg-gray-200">
              <tr>
                <th></th>
                <th>Firmware Name</th>
                <th>Description</th>
                <th>Controller</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 &&
                users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedId === user.id}
                        onChange={() => setSelectedId(user.id)}
                      />
                    </td>
                    <td>{user.file_name}</td>
                    <td>{user.description}</td>
                    <td>{user.Controller}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="text-end">
          <button
            onClick={closemodel}
            className="px-4 m-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 m-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFormModel;

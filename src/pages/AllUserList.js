import { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { getAllUsers } from "../api/mockApis";
import { useNavigate } from "react-router-dom";

// ------------------- Filter Card -------------------
const FilterCard = ({ title, count, onClick, isActive }) => (
    <div
        onClick={onClick}
        className={`cursor-pointer bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition ${
            isActive ? "border-l-4 border-l-orange-500 bg-orange-50" : ""
        }`}
    >
        <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
        <div className="text-2xl font-bold text-orange-700">{count}</div>
    </div>
);

// ------------------- Status Badge -------------------
const StatusBadge = ({ text, color }) => {
    const colors = {
        green: "bg-green-100 text-green-800",
        blue: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[color]}`}>
            {text}
        </span>
    );
};

// ------------------- Active Day Function -------------------
function activeDay(dateStr) {
    if (!dateStr) return "-";

    const d = new Date(dateStr);
    if (isNaN(d)) return "-";

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startGiven = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffDays = Math.floor((startToday - startGiven) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays === 7) return "week ago";

    const months = Math.floor(diffDays / 30);
    if (months === 1) return "month ago";
    if (months < 12) return `${months} months ago`;

    const years = Math.floor(months / 12);
    return years === 1 ? "year ago" : `${years} years ago`;
}

// ------------------- Main Component -------------------
const AllUserList = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const [totalRows, setTotalRows] = useState(0);
    const [totalCounts, setTotalCounts] = useState({
        all: 0,
        active: 0,
        verified: 0,
    });

    // -------- Fetch Paginated Data (Also returns total counts) --------
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getAllUsers({
                pageno: page,
                limit,
                search,
                filter: activeFilter,
            });

            setUsers(res.data);
            setTotalRows(res.total);

            // Backend also returns total2 (active) & total3 (verified)
            setTotalCounts({
                all: res.total,
                active: res.total2,
                verified: res.total3,
            });
        } catch (err) {
            console.error("Load failed:", err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, activeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ------------------- Table Columns -------------------
    const columns = useMemo(
        () => [
            { name: "ID", selector: (row) => row.ID, sortable: true, width: "80px" },
            { name: "Email", selector: (row) => row.Email, sortable: true },
            {
                name: "Status",
                cell: (row) => (
                    <div className="flex gap-2">
                        {row.Isactive && <StatusBadge text="Active" color="green" />}
                        {row.isVerify === 1 && <StatusBadge text="Verified" color="blue" />}
                        {!row.Isactive && row.isVerify !== 1 && (
                            <StatusBadge text="Inactive" color="gray" />
                        )}
                    </div>
                ),
            },
            { name: "Reg Date", selector: (row) => activeDay(row.RegDate) },
            { name: "Last Login", selector: (row) => activeDay(row.LastLoginDate) },
        ],
        []
    );

    // ------------------- Row Click -------------------
    const handleRowClick = useCallback(
        (row) => {
            navigate(`/users/${row.ID}/plants`);
        },
        [navigate]
    );

    // ------------------- Render -------------------
    return (
        <div className="p-6">
            {/* Filter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <FilterCard
                    title="Total Users"
                    count={totalCounts.all}
                    onClick={() => setActiveFilter("all")}
                    isActive={activeFilter === "all"}
                />
                <FilterCard
                    title="Active Users"
                    count={totalCounts.active}
                    onClick={() => setActiveFilter("active")}
                    isActive={activeFilter === "active"}
                />
                <FilterCard
                    title="Verified Users"
                    count={totalCounts.verified}
                    onClick={() => setActiveFilter("verified")}
                    isActive={activeFilter === "verified"}
                />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={users}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationDefaultPage={page}
                paginationPerPage={limit}
                progressPending={loading}
                onChangePage={(p) => setPage(p)}
                onChangeRowsPerPage={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
                onRowClicked={handleRowClick}
                highlightOnHover
                pointerOnHover
                subHeader
                subHeaderComponent={
                    <input
                        type="text"
                        placeholder="Search email or name..."
                        className="border p-2 rounded w-1/3"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                }
            />
        </div>
    );
};

export default AllUserList;

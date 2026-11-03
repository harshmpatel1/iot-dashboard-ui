import PlantList from '../features/plants/PlantList';

const UsersPage = ({Id}) => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Manage Users</h1>
      <PlantList Id={Id}/>
    </div>
  );
};

export default UsersPage;

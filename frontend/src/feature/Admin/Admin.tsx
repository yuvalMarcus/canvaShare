import UsersTable from '../../components/Table/UsersTable.tsx'
import CanvasesTable from "../../components/Table/CanvasesTable.tsx";
import Test from "../../components/Test.tsx";

const Admin = () => {

    return (
        <>
            <CanvasesTable />
            <Test />
            <UsersTable />
        </>
    );
};

export default Admin;


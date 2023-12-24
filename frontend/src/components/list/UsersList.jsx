import { useEffect } from 'react'
import styled from "styled-components";
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom';
import { userDelete, usersFetch } from '../../slices/userSlice';


const UsersList = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { list } = useSelector((state) => state.users)

    useEffect(() => {
        dispatch(usersFetch())
    }, [dispatch])

    const rows = list && list.map((user) => {
        return {
            id: user._id,
            uName: user.name,
            uEmail: user.email,
            isAdmin: user.isAdmin,
        };
    });



    const columns = [
        { field: 'id', headerName: 'ID', width: 220 },
        {
            field: "uName",
            headerName: "Name",
            width: 150
        },
        { field: 'pEmail', headerName: 'Email', width: 200 },
        {
            field: 'isAdmin', headerName: 'Role', width: 100, renderCell: (params) => (
                <Actions>
                    {params.row.isAdmin ? (<Admin>Admin</Admin>) : (<Customer>Customer</Customer>)}
                </Actions>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            width: 120,
            renderCell: (params) => (
                <Actions>
                    <Delete onClick={() => handleDelete(params.row.id)}>Delete</Delete>
                    {/* <EditProduct prodID={params.row.id} /> */}
                    <View onClick={() => navigate(`/user/${params.row.id}`)}>View</View>
                </Actions>
            )
        }

    ];

    const handleDelete = (id) => {
        dispatch(userDelete(id))
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
            />
        </div>
    );
}

export default UsersList

const Actions = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;

  button {
    border: none;
    outline: none;
    padding: 3px 5px;
    color: white;
    border-radius: 3px;
    cursor: pointer;
  }
`;

const Delete = styled.button`
  background-color: rgba(255, 0, 0, 1);
`;

const View = styled.button`
  background-color: rgba(114, 77, 225, 0.4);
`;

const Admin = styled.div`
  color: rgb(253, 181, 40);
  background: rgba(253, 181, 40, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const Customer = styled.div`
  color: rgb(38, 198, 249);
  background: rgba(38, 198, 249, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;
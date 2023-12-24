import React from 'react';
import styled from "styled-components";
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { productsDelete } from '../../slices/productsSlice';
import EditProduct from '../admin/EditProduct';


const ProductsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.products);

  const rows = items.map((item) => ({
    id: item._id,
    imageUrl: item.images[0].url,
    pName: item.name,
    pDesc: item.desc,
    price: item.price.toLocaleString(),
  }));

  const columns = [
    { field: 'id', headerName: 'ID', width: 220 },
    {
      field: 'imageUrl',
      headerName: 'Image',
      renderCell: (params) => (
        <ImageContainer>
          <img src={params.row.imageUrl} alt={params.row.pName || 'Product Image'} />
        </ImageContainer>
      ),
      width: 80,
    },
    { field: 'pName', headerName: 'Name', width: 130 },
    { field: 'pDesc', headerName: 'Description', width: 130 },
    { field: 'price', headerName: 'price', width: 80 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 170,
      renderCell: (params) => (
        <Actions>
          <Delete onClick={() => handleDelete(params.row.id)}>Delete</Delete>
          <EditProduct prodID={params.row.id} />
          <View onClick={() => navigate(`/product/${params.row.id}`)}>View</View>
        </Actions>
      ),
    },
  ];

  const handleDelete = (id) => {
    dispatch(productsDelete(id));
  };

  // Log prodID

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
};

export default ProductsList;

const ImageContainer = styled.div`
  img {
    height: 40px;
  }
`;

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

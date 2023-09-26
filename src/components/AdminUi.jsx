import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Modal, Button } from "react-bootstrap";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

const AdminUI = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editedUserData, setEditedUserData] = useState({
    id: "",
    name: "",
    email: "",
    role: ""
  });

  const [error, setError] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    axios
      .get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      )
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        setError("Error fetching user data. Please try again later.");
        console.error("Error fetching user data:", error);
      });
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.role.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchText, users]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditedUserData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setUserToEdit(null);
    setShowEditModal(false);
    setEditedUserData({
      id: "",
      name: "",
      email: "",
      role: ""
    });
  };
  const saveChanges = () => {
    if (userToEdit) {
      const updatedUsers = users.map((user) => {
        if (user.id === userToEdit.id) {
          return {
            ...user,
            name: editedUserData.name,
            email: editedUserData.email,
            role: editedUserData.role
          };
        }
        return user;
      });
      setUsers(updatedUsers);
      closeEditModal();
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const toggleRowSelection = (id) => {
    const isSelected = selectedRows.includes(id);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const deleteSelectedRows = () => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setUserToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={`btn btn-outline-primary ${
            i === currentPage ? "active" : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col text-center">
          <h1 className="display-4 font-weight-bold">Admin UI</h1>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <input
            type="text"
            placeholder="Search"
            className="form-control mb-3"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={() => {
                      const allRowIds = paginatedUsers.map((user) => user.id);
                      if (selectedRows.length === allRowIds.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(allRowIds);
                      }
                    }}
                    checked={selectedRows.length === paginatedUsers.length}
                  />
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={
                    selectedRows.includes(user.id) ? "table-active" : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => toggleRowSelection(user.id)}
                      checked={selectedRows.includes(user.id)}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => openEditModal(user)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>

                    <button
                      className="btn btn-sm ml-2"
                      onClick={() => openDeleteModal(user)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <Modal show={showDeleteModal} onHide={closeDeleteModal}>
              <Modal.Header closeButton>
                <Modal.Title>Delete Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete{" "}
                <strong>{userToDelete?.name}</strong>?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeDeleteModal}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>
            <Modal show={showEditModal} onHide={closeEditModal}>
              <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="form-group">
                  <label>ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedUserData.id}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedUserData.name}
                    onChange={(e) =>
                      setEditedUserData({
                        ...editedUserData,
                        name: e.target.value
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedUserData.email}
                    onChange={(e) =>
                      setEditedUserData({
                        ...editedUserData,
                        email: e.target.value
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedUserData.role}
                    onChange={(e) =>
                      setEditedUserData({
                        ...editedUserData,
                        role: e.target.value
                      })
                    }
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={saveChanges}>
                  Update
                </Button>
              </Modal.Footer>
            </Modal>
          </table>
          <div className="d-flex justify-content-center">
            <div>
              {currentPage > 1 && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              )}
              {renderPaginationButtons()}
              {currentPage < totalPages && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col">
          <button
            className="btn btn-danger"
            onClick={deleteSelectedRows}
            disabled={selectedRows.length === 0}
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUI;

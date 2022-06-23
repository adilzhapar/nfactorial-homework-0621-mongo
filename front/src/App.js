import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import axios from 'axios';

const BASE_URL = "http://localhost:8080";

// button-group
const buttons = [
  {
    type: "all",
    label: "All",
  },
  {
    type: "active",
    label: "Active",
  },
  {
    type: "done",
    label: "Done",
  },
];


// const todos = JSON.parse(localStorage.getItem('items')) || [];

function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [items, setItems] = useState([]);
  const [prior, setPriority] = useState();

  const [filterType, setFilterType] = useState("");
  const [searchTxt, setSearchTxt] = useState("");

  // localStorage.setItem('items', JSON.stringify(items));

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };

  const handlePriority = (e) => {
    setPriority(e.target.value);
  }

  const handleAddItem = () => {
    setItems((prevItems) => [
      { name: itemToAdd, priority: prior},
      ...prevItems
    ]);

    setItemToAdd("");
    setPriority("");
    const name = itemToAdd;
    const priority = parseInt(prior);

    axios.post(`${BASE_URL}/task`,
      {
        name,
        priority,
      })
      .then((response) => {
        setItems([...items, response.data]);
      });
  };

  const handleItemDone = ({ _id }) => {

    //second way updated
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === _id) {
            return { ...item, done: !item.done };
          } else return item;
        })
      );
    }

  const handleItemImportant = ({_id}) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if(item._id === _id) {
          return {...item, important: !item.important}
        }else return item;
      })
    );
  }

  const handleItemDelete = ({_id}) => {
    axios
    .delete(`${BASE_URL}/task/${_id}`)
    .then(res => console.log('deleted'))
    .catch('err', err => console.log(err));;


    const newList = items.filter((item) => item._id !== _id);

    setItems(newList);

  }

  const handleFilterItems = (type) => {
    setFilterType(type);
  };

  const handleChangeSearch = (event) => {
    setFilterType("search");
    // console.log(event.target.value);
    setSearchTxt(event.target.value);
    
  }

  const handleSortByName = () => {
    axios.get(`${BASE_URL}/names`).then((response) => {
      setItems(response.data);
    });
  }

  const handleSortByPriority = () => {
    axios.get(`${BASE_URL}/priorities`).then((response) => {
      setItems(response.data);
    });
  }
  useEffect(() => {
    axios.get(`${BASE_URL}/tasks`).then((response) => {
      setItems(response.data);
    });
  }, []);
  

  const amountDone = items.filter((item) => item.done).length;

  const amountLeft = items.length - amountDone;

  const filteredItems =
    !filterType || filterType === "all" 
      ? items 
      : filterType === "search" 
      ? items.filter((item) => item.name.includes(searchTxt))
      : filterType === "active" 
      ? items.filter((item) => !item.done)
      : items.filter((item) => item.done);

  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
        <h2>
          {amountLeft} more to do, {amountDone} done
        </h2>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          onChange={handleChangeSearch}
        />
        {/* Item-status-filter */}
        <div className="btn-group">
          {buttons.map((item) => (
            <button
              onClick={() => handleFilterItems(item.type)}
              key={item.type}
              type="button"
              className={`btn btn-${
                filterType !== item.type ? "outline-" : ""
              }info`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="btn-group">
          <button
            onClick={handleSortByName}
            type="button"
            className="btn info"
          >
            Sort by Name
          </button>
          
          <button
            onClick={handleSortByPriority}
            type="button"
            className="btn info"
          >
            Sort by Priority
          </button>


        </div>
      </div>

      {/* List-group */}
      <ul className="list-group todo-list">
        {filteredItems.length > 0 &&
          filteredItems.map((item) => (
            <li key={item._id} className="list-group-item">
              <span className={`todo-list-item${item.done ? " done" : ""} ${item.important ? " important": ""}`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => handleItemDone(item)}
                > 
                [{item.priority}] {item.name}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                  onClick={() => handleItemImportant(item)}
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleItemDelete(item)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />
        <input
          value={prior}
          type="text"
          className="form-control"
          placeholder="Priority"
          onChange={handlePriority}
        />
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>
      </div>
    </div>
  );
}

export default App;

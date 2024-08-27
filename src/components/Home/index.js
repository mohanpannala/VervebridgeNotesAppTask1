import { Component } from "react";
import { RiStickyNoteAddFill} from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import { CgFolderAdd } from "react-icons/cg";
import { TiDelete } from "react-icons/ti";
import { TbLogout } from "react-icons/tb";
import { Redirect } from 'react-router-dom'; 
import Notes from "../Notes";
import './index.css';

class Home extends Component {
    state = {
        notes: [],
        newNote: { title: "", description: "" },
        selectedCategory: "ALL",
        isFormVisible: false,
        editMode: false,
        currentNoteIndex: null,
        optionsVisibleForIndex: null,
        personalizationVisibleForIndex: null,
        searchTerm: "",
        categories: ["ALL"],
        isAddCategory: false,
        newCategory: '',
        redirectToLogin: false 
    }

    handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token from local storage
        this.setState({ redirectToLogin: true }); // Set redirect state to redirect the user to login page
    }
    async componentDidMount() {

        const token = localStorage.getItem('token')

        // fetching the notes data respective to the user from the Database

        const options = {
            headers:{
                Authorization: `Bearer ${token}`
            }
        } 

        const response = await fetch('http://localhost:5000/notes', options);
        if (!response.ok) {
             console.error('Failed to fetch notes');
        return;
        }
        const notes = await response.json();

        // fetching the categories data respective to the user from the Database

        const categoriesResponse = await fetch('http://localhost:5000/categories', options);
        if (!response.ok) {
             console.error('Failed to fetch notes');
        return;
        }

        const categories = await categoriesResponse.json();

        const categoriesWithAll = [{name: "ALL" }, ...categories];

        this.setState({
            notes,
            categories: categoriesWithAll, 
            selectedCategory: "ALL" 
        });
    }
    
    //to handle the category change 
    handleCategoryChange = (category) => {
        this.setState({
            selectedCategory: category.name,
            isFormVisible: false
        });

    }
    
    // to handle the popup visibility in edit mode
    toggleFormVisibility = (noteIndex = null,_id) => {
        if (noteIndex !== null) {
            const note = this.state.notes.find(note => note._id === _id); 
            this.setState({
                isFormVisible: true,
                editMode: true,
                currentNoteIndex: _id,
                newNote: {
                    title: note.title,
                    description: note.description,
                    fontColor: note.fontColor,
                    backgroundColor: note.backgroundColor
                },
                optionsVisibleForIndex: null,
                personalizationVisibleForIndex: null
            });
        } else {
            this.setState(prev => ({
                isFormVisible: !prev.isFormVisible,
                editMode: false,
                currentNoteIndex: null,
                newNote: { title: "", description: "", fontColor: "#000000", backgroundColor: "#deb887" },
                optionsVisibleForIndex: null,
                personalizationVisibleForIndex: null
            }));
        }
    }
    
    
    // t handle when the notes are clicked

    handleNoteClick = (index,_id) => {
        this.toggleFormVisibility(index,_id);
    }

    // method to handle the update or add the notes 

    addOrUpdateNote = async () => {
        const { selectedCategory, newNote, editMode, currentNoteIndex } = this.state;
        const note = this.state.notes.find(note => note._id === currentNoteIndex)

        if (editMode) {
            const newNoteData = {
                category: note.category,
                title: newNote.title,
                description: newNote.description,
                createdAt: editMode ? note.createdAt : new Date(),
                updatedAt: new Date(),
                isImportant: editMode ? note.isImportant : false,
                fontColor: newNote.fontColor,
                backgroundColor: newNote.backgroundColor
            }
            
            // updating the notes data respective to the user from the Database

            const token = localStorage.getItem("token")
            const response = await fetch(`http://localhost:5000/notes/${currentNoteIndex}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newNoteData),
            });
    
            if (response.ok) {
                const updatedNote = await response.json();
                this.setState(prev => {
                    const updatedNotes = prev.notes.map((note) =>
                        note._id === currentNoteIndex ? updatedNote : note
                    );
                    return {
                        notes: updatedNotes,
                        isFormVisible: false,
                        editMode: false,
                        currentNoteIndex: null,
                        newNote: { title: "", description: "", fontColor: "#000000", backgroundColor: "#deb887" },
                        personalizationVisibleForIndex: null
                    };
                });
            }
        } else {

            // adding the new notes data respective to the user to the Database

            const newNoteData = {
            category: selectedCategory,
            title: newNote.title,
            description: newNote.description,
            createdAt: editMode ? note.createdAt : new Date(),
            updatedAt: new Date(),
            isImportant: editMode ? note.isImportant : false,
            fontColor: newNote.fontColor,
            backgroundColor: newNote.backgroundColor
        };
            const token = localStorage.getItem("token")
            const response = await fetch('http://localhost:5000/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newNoteData),
            });
    
            if (response.ok) {
                const addedNote = await response.json();
                this.setState(prev => ({
                    notes: [...prev.notes, addedNote],
                    isFormVisible: false,
                    newNote: { title: "", description: "", fontColor: "#000000", backgroundColor: "#deb887" },
                    personalizationVisibleForIndex: null
                }));
            }
        }
    }
    
    
    // method to add the new category data respective to the user to the Database

    addOrUpdateCategory = async (event) => {

        event.preventDefault();
        const { newCategory } = this.state;
        const token = localStorage.getItem("token")
        const response = await fetch('http://localhost:5000/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: newCategory }),
        });

        const addedCategory = await response.json();

        this.setState(prev => ({
            categories: [...prev.categories, addedCategory],
            isAddCategory: false,
            newCategory : ""
        }));
    }
    
    //method to take the value of the new category

    handleNewCategoryChange = (event) => {
        this.setState({ newCategory: event.target.value });
    }

    //method to handle the deletion of the category 
    handleDeleteCategory = async (category, event) => {
        event.stopPropagation();
        
        const catId = category._id
        // Fetch the notes for the category being deleted
        const notesToDelete = this.state.notes.filter(note => note.category === category.name);
        const token = localStorage.getItem('token')
        // Delete all notes that belong to the category
        await Promise.all(
            notesToDelete.map(async note => {
                await fetch(`http://localhost:5000/notes/${note._id}`, { method: 'DELETE' ,headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            }
            )
    }));
    
        // Delete the category
        await fetch(`http://localhost:5000/categories/${category._id}`, { method: 'DELETE' ,headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
    }
    )

    
        // Update the state to remove the category and its associated notes from the UI
        this.setState(prev => {
            const updatedCategories = prev.categories.filter(category => category._id !== catId);
            const updatedNotes = prev.notes.filter(note => note.category !== category.name);
            return {
                categories: updatedCategories,
                notes: updatedNotes,
                selectedCategory: prev.selectedCategory === category.name? "ALL" : prev.selectedCategory
            };
        });
    }
    
    
    
    //method to collect the title values
    onTitleChange = (event) => {
        this.setState(prev => ({
            newNote: { ...prev.newNote, title: event.target.value }
        }));
    }
    
    //method to collect the description values
    onDescriptionChange = (event) => {
        this.setState(prev => ({
            newNote: { ...prev.newNote, description: event.target.value }
        }));
    }


    //method to handle the popup for the options
    toggleOptionsVisibility = (id, event) => {
        event.stopPropagation(); // Prevents the note click from triggering
        this.setState(prev => ({
            optionsVisibleForIndex: prev.optionsVisibleForIndex === id ? null : id,
            personalizationVisibleForIndex: null
        }));
    }


    //method to handle the color popup 
    togglePersonalizationVisibility = (index, event) => {
        event.stopPropagation(); // Prevents the note click from triggering
        this.setState(prev => ({
            personalizationVisibleForIndex: prev.personalizationVisibleForIndex === index ? null : index,
            optionsVisibleForIndex: null
        }));
    }
 
    //method to handle the delete note 
    handleDeleteNote = async (id) => {
        const token = localStorage.getItem('token')
        const noteToDelete = this.state.notes.find(note => note._id === id);
        // Make the DELETE request to the backend
        await fetch(`http://localhost:5000/notes/${noteToDelete._id}`,{ method: 'DELETE' ,headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
    });

        // Update the state to remove the note from the UI
        this.setState(prev => ({
            notes: prev.notes.filter(note => note._id !== id),
            optionsVisibleForIndex: null,
            personalizationVisibleForIndex: null
        }));
    }
    
 
    //method to tract the status of the notes weather it is important or not
    handleMarkAsImportant = (id) => {
        const { notes } = this.state;
        const updatedNotes = notes.map(note => 
            note._id === id ? { ...note, isImportant: !note.isImportant } : note
        );
    
        this.setState({ notes: updatedNotes, optionsVisibleForIndex: null, personalizationVisibleForIndex: null });
    }
    
    //method to tract the value of search
    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    }

    //method to tract the value for font color
    handleFontColorChange = (id, event) => {
        this.setState(prev => {
            const updatedNotes = prev.notes.map((note) =>
                note._id === id ? { ...note, fontColor: event.target.value } : note
            );
            return { notes: updatedNotes };
        });
    }
    
    //method to tract the value for backgroundcolor
    handleBackgroundColorChange = (id, event) => {
        this.setState(prev => {
            const updatedNotes = prev.notes.map((note) =>
                note._id === id ? { ...note, backgroundColor: event.target.value } : note
            );
            return { notes: updatedNotes };
        });
    }
    

    addOrUpdateNoteForPersonalization = async (id) => {
        const { notes } = this.state;
        const updatedNote = notes.find(note => note._id === id);
    
        const updatedNoteData = {
            category: updatedNote.category,
            title: updatedNote.title,
            description: updatedNote.description,
            createdAt: updatedNote.createdAt,
            updatedAt: new Date(),
            isImportant: updatedNote.isImportant,
            fontColor: updatedNote.fontColor,
            backgroundColor: updatedNote.backgroundColor
        }
        
        const token = localStorage.getItem("token")
        console.log(token)
        const response = await fetch(`http://localhost:5000/notes/${updatedNote._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updatedNoteData),
        });
    
        if (response.ok) {
            const updatedNoteFromServer = await response.json();
            this.setState(prev => ({
                notes: prev.notes.map((note) =>
                    note._id === id ? updatedNoteFromServer : note
                ),
                optionsVisibleForIndex: null,
                personalizationVisibleForIndex: null
            }));
        } else {
            console.error('Failed to update note');
        }
    }
    

    addNewCategory = () => {
        const {isAddCategory} = this.state
        this.setState({ isAddCategory: !isAddCategory })
    }

    render() {
        const { redirectToLogin,notes, categories,isAddCategory, isFormVisible, selectedCategory, editMode, optionsVisibleForIndex, personalizationVisibleForIndex, searchTerm } = this.state;
        // Filter notes based on the selected category and search term
        if (redirectToLogin) {
            return <Redirect to="/" />;
        }

        const filteredNotes = notes.filter(note =>
            (selectedCategory === "ALL" || note.category.toLowerCase() === selectedCategory.toLowerCase()) &&
            note.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        
        

        const formatDateIST = (dateString) => {
            const date = new Date(dateString);
            
            // Convert UTC time to IST (UTC + 5:30)
            const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
            const istTime = new Date(date.getTime() + istOffset);
        
            // Format the IST time
            const [fullDate, fullTime] = istTime.toISOString().split('T');
            const [year, month, day] = fullDate.split('-');
            const [time] = fullTime.split('.');
            
            return `${day}/${month}/${year}, ${time}`;
        }
        
    
        return (
            <div className="notes-main-container">
            <p onClick={this.handleLogout} className="logout"> LOGOUT <TbLogout className="logout-icon"/> </p>
                <h1 className="notes-head">Notes Application</h1>
                
                <div className="search-container">
                    <input
                        type="search"
                        className="search-input"
                        placeholder="Search Notes by Title"
                        value={searchTerm}
                        onChange={this.handleSearchChange}
                    />
                    <FaSearch className="search-icon" />
                </div>
                <ul className="category-list">
                    {categories.map(category => (
                        <li
                            key={category._id}
                            className={`category-item ${selectedCategory === category.name ? 'selected' : ''}`}
                            onClick={() => this.handleCategoryChange(category)}
                        >
                            {category.name}
                            {category.name !== "ALL" && (
                                <TiDelete className="delete-category-button" onClick={(event) => this.handleDeleteCategory(category, event)} />
                            )}
                        </li>
                    ))}

                    <li onClick={this.addNewCategory}><CgFolderAdd className="add-new-category" /></li>

                    {isAddCategory && (
                        <form className="category-popup" onSubmit={this.addOrUpdateCategory}>
                            <input
                                type="text"
                                placeholder="Category name"
                                value={this.state.newCategory}
                                onChange={this.handleNewCategoryChange}
                                required
                                className="category-input"
                            />
                            <button type="submit">Add</button>
                        </form>
                    )}
                </ul>

                <ul className="notes-container">
                    {filteredNotes.map((note, index) => (
                        <Notes  key={note._id}
                            note={note} index={index} 
                            optionsVisibleForIndex={optionsVisibleForIndex} 
                            personalizationVisibleForIndex={personalizationVisibleForIndex}
                            formatDateIST={formatDateIST} 
                            toggleOptionsVisibility={this.toggleOptionsVisibility}
                            togglePersonalizationVisibility = {this.togglePersonalizationVisibility}
                            handleFontColorChange = {this.handleFontColorChange}
                            handleBackgroundColorChange = {this.handleBackgroundColorChange}
                            handleNoteClick = {this.handleNoteClick}
                            handleDeleteNote = {this.handleDeleteNote}
                            handleMarkAsImportant = {this.handleMarkAsImportant}
                            addOrUpdateNoteForPersonalization = {this.addOrUpdateNoteForPersonalization}

                            />
                    ))}
                    <button className="add-button" onClick={() => this.toggleFormVisibility()}><RiStickyNoteAddFill /> <span className="new-note-text">New Note</span></button>
    
                    {isFormVisible && (
                        <div className="popup-form">
                            <form onSubmit={this.addOrUpdateNote}>
                                <div className="new-input-container notes-item" style={{ backgroundColor: this.state.newNote.backgroundColor }}>
                                    <input type="text" id="title" name="title" placeholder="Title"  style={{ color: this.state.newNote.fontColor}} className="title-field" onChange={this.onTitleChange} value={this.state.newNote.title} />
                                    <textarea id="description" name="description" className="description-field" placeholder="Description" style={{ color: this.state.newNote.fontColor}} onChange={this.onDescriptionChange} value={this.state.newNote.description} />
                                </div>
                                <div className="form-buttons-container">
                                    <button type="submit" className="add-update-cancel-button">
                                        {editMode ? "Update Note" : "Add Note"}
                                    </button>
                                    <button type="button" className="add-update-cancel-button" onClick={() => this.toggleFormVisibility()}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </ul>
            </div>
        );
    }
    
}

export default Home;

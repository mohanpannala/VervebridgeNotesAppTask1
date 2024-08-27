import { Component } from "react";
import { RiStarFill } from "react-icons/ri";
import { SlOptionsVertical } from "react-icons/sl";
import './index.css'

class Notes extends Component{
    render(){

        // the fallowing methods and states are accessed which are passed from the home component using props

        const {note, 
            index, 
            optionsVisibleForIndex, 
            personalizationVisibleForIndex, 
            formatDateIST, 
            toggleOptionsVisibility,
            togglePersonalizationVisibility,
            handleFontColorChange,
            handleNoteClick,
            handleDeleteNote,
            handleBackgroundColorChange,
            handleMarkAsImportant,
            addOrUpdateNoteForPersonalization
        
        } = this.props
        return(
            // the note which are mapped from the home comonent are displayed according to the following HTML code in UI
                
                <li
                    key={index}
                    className="notes-item"
                    style={{ color: note.fontColor, backgroundColor: note.backgroundColor }} //used to change the colors of notes
                    onClick={() => handleNoteClick(index, note._id)} // to handle the respective notes action
                >
                    <div className="title-options-container">
                        <h1 className="notes-title" style={{color: note.fontColor}} onClick={(event) => event.stopPropagation()}>
                        {note.title}
                        </h1>
                        {note.isImportant && <RiStarFill className="important-icon" />}
                        <SlOptionsVertical className="options-icon" onClick={(event) => toggleOptionsVisibility(note._id, event)} />
                        {optionsVisibleForIndex === note._id && (
                            <div className="options-popup" onClick={(event) => event.stopPropagation()}>
                                    <p onClick={() => handleMarkAsImportant(note._id)}>
                                    {note.isImportant ? "Unmark Important" : "Mark as Important"}
                                    </p>
                                    <p onClick={() => handleDeleteNote(note._id)}>Delete Note</p>
                                    <p onClick={(event) => togglePersonalizationVisibility(note._id, event)}>Personalization</p>
                            </div>
                        )}
                                
                        {personalizationVisibleForIndex === note._id && (
                            <div className="personalization-popup" onClick={(event) => event.stopPropagation()}>
                                <div className="color-picker">
                                    <label htmlFor={`fontColor-${note._id}`}>Font Color:</label>
                                    <input
                                        type="color"
                                        className="color-input"
                                        id={`fontColor-${note._id}`}
                                        value={note.fontColor}
                                        onChange={(event) => handleFontColorChange(note._id, event)}
                                        onClick={(event) => event.stopPropagation()} // Prevent click from popup
                                    />
                                </div>
                                <div className="color-picker">
                                    <label htmlFor={`backgroundColor-${note._id}`}>Background Color:</label>
                                    <input
                                        type="color"
                                        className="color-input"
                                        id={`backgroundColor-${note._id}`}
                                        value={note.backgroundColor}
                                        onChange={(event) => handleBackgroundColorChange(note._id, event)}
                                        onClick={(event) => event.stopPropagation()} // Prevent click from popup
                                        />
                                </div>
                                    <button type="button" onClick={() => addOrUpdateNoteForPersonalization(note._id)} className="add-update-cancel-button personalization">Update</button>
                                    
                                </div>
                        )}
   
                    </div>
                    <hr />
                    <p className="description" style={{color: note.fontColor}}>{note.description}</p>
                    <div className="date-time-container" >
                        <p className="date-info" style={{color: note.fontColor}} >
                            Created: <span className="time-date">{formatDateIST(note.createdAt)}</span>
                        </p>
                        <p className="date-info" style={{color: note.fontColor}}>
                            Last Modified: <span className="time-date">{formatDateIST(note.updatedAt)}</span>
                        </p>
                    </div>
                </li>
        )
    }
}

export default Notes
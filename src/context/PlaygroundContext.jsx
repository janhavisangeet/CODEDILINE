import { createContext, useState, useEffect } from "react";
import { v4 as uuid } from 'uuid';

export const PlaygroundContext = createContext();

export const languageMap = {
   
    "python": {
        id: 71,
        defaultCode: `print("Hello World!")`,
    },
   
}

const PlaygroundProvider = ({ children }) => {

    const initialItems = {
        [uuid()]: {
            title: "DSA",
            playgrounds: {
                [uuid()]: {
                    title: "Sample Code",
                    language: "python",
                    code: languageMap["python"].defaultCode,
                },
               
            }
        },
    }

    const [folders, setFolders] = useState(() => {
        let localData = localStorage.getItem('playgrounds-data');
        if (localData === null || localData === undefined) {
            return initialItems;
        }

        return JSON.parse(localData);
    })

    useEffect(() => {
        localStorage.setItem('playgrounds-data', JSON.stringify(folders));
    }, [folders])

    const deleteCard = (folderId, cardId) => {
        
    }

    const deleteFolder = (folderId) => {
       
    }

    const addFolder = (folderName) => {
        setFolders((oldState) => {
            const newState = { ...oldState };

            newState[uuid()] = {
                title: folderName,
                playgrounds: {}
            }

            return newState;
        })
    }

    const addPlayground = (folderId, playgroundName, language) => {
        setFolders((oldState) => {
            const newState = { ...oldState };

            newState[folderId].playgrounds[uuid()] = {
                title: playgroundName,
                language: language,
                code: languageMap[language].defaultCode,
            }

            return newState;
        })
    }

    const addPlaygroundAndFolder = (folderName, playgroundName, cardLanguage) => {
        setFolders((oldState) => {
            const newState = { ...oldState }

            newState[uuid()] = {
                title: folderName,
                playgrounds: {
                    [uuid()]: {
                        title: playgroundName,
                        language: cardLanguage,
                        code: languageMap[cardLanguage].defaultCode,
                    }
                }
            }

            return newState;
        })
    }

    const editFolderTitle = (folderId, folderName) => {
       
    }

    const editPlaygroundTitle = (folderId, cardId, PlaygroundTitle) => {
       
    }

    const savePlayground = (folderId, cardId, newCode, newLanguage) => {
        setFolders((oldState) => {
            const newState = { ...oldState };
            newState[folderId].playgrounds[cardId].code = newCode;
            newState[folderId].playgrounds[cardId].language = newLanguage;
            return newState;
        })
    }

    const PlayGroundFeatures = {
        folders: folders,
        deleteCard: deleteCard,
        deleteFolder: deleteFolder,
        addFolder: addFolder,
        addPlayground: addPlayground,
        addPlaygroundAndFolder: addPlaygroundAndFolder,
        editFolderTitle: editFolderTitle,
        editPlaygroundTitle: editPlaygroundTitle,
        savePlayground: savePlayground,
    }

    return (
        <PlaygroundContext.Provider value={PlayGroundFeatures}>
            {children}
        </PlaygroundContext.Provider>
    )
}

export default PlaygroundProvider;
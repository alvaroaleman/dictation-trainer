import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
	const [sentenceInputOpen, setDialogOpen] = useState<boolean>(false);
	useEffect(() => {
		const data = localStorage.getItem('sentences');

		if (!data) {
			setDialogOpen(true); // Open dialog if no data
		}
	}, []);

	const handleClose = (): void => {
		setDialogOpen(false);
	};
	return (
		<div>
			<SentenceInputDialog isOpen={sentenceInputOpen} onClose={handleClose} />
		</div>
	);
}

interface SimpleDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

const SentenceInputDialog: React.FC<SimpleDialogProps> = ({ isOpen, onClose }) => {
	const [inputData, setInputData] = useState<string>('');

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputData(event.target.value);
	};

	const handleSave = () => {
		localStorage.setItem('sentences', inputData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', background: 'white', padding: '20px', zIndex: 100 }}>
			<h1>Enter the sentences you want to practise</h1>
			<textarea
				rows={5}
				cols={50}
				value={inputData}
				onChange={handleInputChange}
				style={{ width: '100%' }}
			/>
			<div style={{ marginTop: '10px' }}>
				<button onClick={handleSave} style={{ marginRight: '10px' }}>Save</button>
				<button onClick={onClose}>Close</button>
			</div>
		</div>
	);
};


export default App;

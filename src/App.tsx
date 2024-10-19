import React, { useState } from 'react';
import './App.css';

function App() {
	const [sentenceInputOpen, setSentenceInputOpen] = useState<boolean>(true);
	const [sentenceTrainerOpen, setSentenceTrainerOpen] = useState<boolean>(false);
	const [sentences, setSentences] = useState<string>('');

	const handleSentenceInputClose = (data: string): void => {
		setSentences(data)
		setSentenceInputOpen(false);
		setSentenceTrainerOpen(true);
	};

	const handleSentenceTrainerClose = (): void => {
		setSentences('');
		setSentenceInputOpen(true);
		setSentenceTrainerOpen(false);
	};

	return (
		<div>
			<SentenceInputDialog isOpen={sentenceInputOpen} onClose={handleSentenceInputClose} />
			<SentenceTrainer inputData={sentences} isOpen={sentenceTrainerOpen} onClose={handleSentenceTrainerClose} />
		</div>
	);
}


interface SimpleInputDialogProps {
	isOpen: boolean;
	onClose: (data: string) => void;
}

const SentenceInputDialog: React.FC<SimpleInputDialogProps> = ({ isOpen, onClose }) => {
	const [inputData, setInputData] = useState<string>('');

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputData(event.target.value);
	};

	const handleSave = () => {
		onClose(inputData);
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
			</div>
		</div>
	);
};

interface SimpleDialogWithInputProps {
	inputData: string;
	isOpen: boolean;
	onClose: () => void;
}

const SentenceTrainer: React.FC<SimpleDialogWithInputProps> = ({ inputData, isOpen, onClose }) => {
	const [randomLine, setRandomLine] = useState<string>('');

	if (!isOpen) return null;

	const showRandomLine = () => {
		if (inputData) {
			const lines = inputData.split('\n').filter(line => line.trim() !== '');
			const randomIndex = Math.floor(Math.random() * lines.length);
			setRandomLine(lines[randomIndex]);
		}
	};


	return (
		<div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', background: 'grey', padding: '20px', zIndex: 100 }}>
			<div>
				{randomLine && <p>Sentence: {randomLine}</p>}
				<p> There are {inputData.split('\n').length} sentences </p>
				<button onClick={showRandomLine}>Show Random Sentence</button>
				<button onClick={onClose}>Clear sentences</button>
			</div>
		</div>
	);
};


export default App;

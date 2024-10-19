import React, { useState, useEffect } from 'react';
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
	const [sentenceToCheck, setSentenceToCheck] = useState<string>('');
	const [inputSentence, setInputSentence] = useState<string>('');
	const [sentenceCheckResult, setSentenceCheckResult] = useState<string>('');

	// the setter from useState is not synchronous, so
	// we use a hook to read it after setting it.
	useEffect(() => {
		if (sentenceToCheck) {
			speak();
		}
	}, [sentenceToCheck]);

	const handleSentenceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputSentence(event.target.value);
	};

	if (!isOpen) return null;

	const showRandomLine = () => {
		if (inputData) {
			const lines = inputData.split('\n').filter(line => line.trim() !== '');
			const randomIndex = Math.floor(Math.random() * lines.length);

			setSentenceToCheck(lines[randomIndex]);
			setSentenceCheckResult('');
		}
	};


	const speak = () => {
		console.log("sentenceToCheck: " + sentenceToCheck);
		const utterance = new SpeechSynthesisUtterance(sentenceToCheck);
		for (const voice of speechSynthesis.getVoices()) {
			if (voice.lang === 'fr-FR') {
				utterance.voice = voice;
				// Missing break is not a bug. We use the last because the fist
				// doesn't work.
			}
		}
		utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
			console.error("Speech synthesis error:", event.error);
		};
		utterance.rate = 0.8;
		speechSynthesis.speak(utterance);
	};

	const checkSentence = () => {
		if (inputSentence === sentenceToCheck) {
			setSentenceCheckResult("You got it right!");
		} else {
			setSentenceCheckResult("Not quite: " + sentenceToCheck);
		}
		setSentenceToCheck('');
	};

	const close = () => {
		setSentenceToCheck('');
		onClose();
	}


	return (
		<div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', background: 'grey', padding: '20px', zIndex: 100 }}>
			<div style={{ width: "90%", height: "40%", display: "block", margin: "0 auto" }}>
				{sentenceToCheck &&
					<div>
						<input style={{ width: "100%" }} type="text" placeholder="Enter text here" onChange={handleSentenceInputChange}></input>
						<button onClick={speak}>Repeat</button>
						<button onClick={checkSentence}>Check</button>
					</div>
				}
				{sentenceCheckResult && <div><p>{sentenceCheckResult}</p></div>}
				<p> There are {inputData.split('\n').length} sentences </p>
				{!sentenceToCheck && <button onClick={showRandomLine}>Show Random Sentence</button>}
				<button onClick={close}>Clear sentences</button>
			</div>
		</div>
	);
};


export default App;

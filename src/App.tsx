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
	const [sentenceToCheck, setSentenceToCheck] = useState<string>('');
	const [inputSentence, setInputSentence] = useState<string>('');
	const [sentenceCheckResult, setSentenceCheckResult] = useState<string>('');
	const [speechSynthesisPaused, setSpeechSynthesisPaused] = useState<boolean>(false);

	const handleSentenceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputSentence(event.target.value);
	};

	if (!isOpen) return null;

	let sentenceToCheckLocal: string = '';
	const showRandomLine = () => {
		if (inputData) {
			const lines = inputData.split('\n').filter(line => line.trim() !== '');
			const randomIndex = Math.floor(Math.random() * lines.length);

			setSentenceToCheck(lines[randomIndex]);
			setSentenceCheckResult('');

			// setSentenceToCheck is async but we can not use local state
			// in the repeat button callback as it has a different scope.
			// So we have to use the local var here and the global state in
			// the callback.
			sentenceToCheckLocal = lines[randomIndex];
			speak();
		}
	};

	const speak = () => {
		let sentence: string = sentenceToCheck;
		if (sentence === '') {
			sentence = sentenceToCheckLocal;
		}
		const utterance = new SpeechSynthesisUtterance(sentence);
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
		setSpeechSynthesisPaused(false);
		utterance.rate = 0.8;
		speechSynthesis.cancel();
		speechSynthesis.resume();
		speechSynthesis.speak(utterance);
	};

	const checkSentence = () => {
		if (inputSentence === sentenceToCheck) {
			setSentenceCheckResult("You got it right!");
		} else {
			setSentenceCheckResult("Not quite: " + sentenceToCheck);
		}
	};

	const close = () => {
		setSentenceToCheck('');
		onClose();
	}

	const pauseResume = () => {
		if (speechSynthesisPaused) {
			speechSynthesis.resume();
			setSpeechSynthesisPaused(false);
			console.log("resuming");
		} else {
			setSpeechSynthesisPaused(true);
			speechSynthesis.pause();
			console.log("pausing");
		}
	};

	return (
		<div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', background: 'white', padding: '20px', zIndex: 100 }}>
			<div style={{ width: "90%", height: "40%", display: "block", margin: "0 auto" }}>
				{sentenceToCheck && !sentenceCheckResult &&
					<div>
						<input style={{ width: "100%" }} type="text" placeholder="Enter text here" onChange={handleSentenceInputChange}></input>
						<button onClick={speak}>Repeat</button>
						<button onClick={pauseResume}>Pause/Resume</button>
						<button onClick={checkSentence}>Check</button>
					</div>
				}
				{sentenceCheckResult &&
					<div>
						<p>{sentenceCheckResult}</p>
						<button onClick={() => { setSentenceCheckResult('') }}>Try Again</button>
					</div>
				}
				<p> There are {inputData.split('\n').length} sentences </p>
				<button onClick={showRandomLine}>Show Random Sentence</button>
				<button onClick={close}>Clear sentences</button>
			</div>
		</div>
	);
};


export default App;

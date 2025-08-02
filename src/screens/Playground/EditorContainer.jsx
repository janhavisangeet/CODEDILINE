import React, { useContext, useState } from "react";
import CodeEditor from "./CodeEditor";
import styled from "styled-components";
import { BiEditAlt, BiImport, BiExport, BiFullscreen } from "react-icons/bi";
import { ModalContext } from "../../context/ModalContext";
import Select from "react-select";
import { languageMap } from "../../context/PlaygroundContext";
import model from "../../utils/gemini";
import { Loading } from "../../components/ModalTypes";

const StyledEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: ${({ isFullScreen }) =>
    isFullScreen ? "100vh" : "calc(100vh - 4.5rem)"};
`;

const UpperToolBar = styled.div`
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.8rem 0.4rem;

  @media (max-width: 540px) {
    height: 8rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 540px) {
    width: 100%;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 2.3rem;
  font-size: 1.3rem;
  @media (min-width: 540px) {
    margin-right: 1rem;
  }
`;

const SelectBars = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  & > div {
    width: 8rem;
  }

  & > div:last-child {
    width: 10rem;
  }
`;

const Button = styled.button`
  padding: 0.7rem 0.4rem;
  width: 6.2rem;
  background: #0097d7;
  border: none;
  border-radius: 32px;
  font-weight: 700;
  cursor: pointer;
`;

const CodeEditorContainer = styled.div`
  height: calc(100% - 4rem);

  & > div {
    height: 100%;
  }
`;

const LowerToolBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: 0.8rem 1rem;

  input {
    display: none;
  }

  label,
  a,
  button {
    font-size: 1.2rem;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    color: black;
  }
  button:first-child {
    background: none;
  }
  button:last-child {
    font-weight: 400;
    font-size: 1.1rem;
  }
`;
const SaveAndRunButton = styled.button`
  padding: 0.6rem 1rem;
  background: #0097d7;
  border: none;
  border-radius: 32px;
  font-weight: 700;
  cursor: pointer;
`;

const ConvertButton = styled.button`
  padding: 0.6rem 1rem;
  background: #0097d7;
  border: none;
  border-radius: 32px;
  font-weight: 700;
  cursor: pointer;
`;

const EditorContainer = ({
  title,
  currentLanguage,
  setCurrentLanguage,
  currentCode,
  setCurrentCode,
  folderId,
  playgroundId,
  saveCode,
  runCode,
  getFile,
  isFullScreen,
  setIsFullScreen,
}) => {
  const { isOpenModal, openModal, closeModal } = useContext(ModalContext);
  const [instructionCode, setInstructionCode] = useState("");
  const { modalType } = isOpenModal;
  const themeOptions = [
    { value: "githubDark", label: "githubDark" },
    { value: "githubLight", label: "githubLight" },
    { value: "bespin", label: "bespin" },
    { value: "duotoneDark", label: "duotoneDark" },
    { value: "duotoneLight", label: "duotoneLight" },
    { value: "dracula", label: "dracula" },
    { value: "xcodeDark", label: "xcodeDark" },
    { value: "xcodeLight", label: "xcodeLight" },
    { value: "vscodeDark", label: "vscodeDark" },
    { value: "vscodeLight", label: "vscodeLight" },
    { value: "okaidia", label: "okaidia" },
  ];

  const languageOptions = [
    { value: "cpp", label: "cpp" },
    // { value: 'javascript', label: 'javascript' },
    // { value: 'java', label: 'java' },
    { value: "python", label: "python" },
  ];

  const handleThemeChange = (selectedOption) => {
    setCurrentTheme(selectedOption);
  };

  const [currentTheme, setCurrentTheme] = useState({
    value: "githubDark",
    label: "githubDark",
  });
  const [language, setLanguage] = useState(() => {
    for (let i = 0; i < languageOptions.length; i++) {
      if (languageOptions[i].value === currentLanguage) {
        return languageOptions[i];
      }
    }
    return languageOptions[0];
  });

  function stripMarkdownWrapper(code) {
    return code.replace(/```[\w]*\n?|```$/g, "").trim();
  }

  const handleGptSearchClick = async (selectedOption) => {
    try {
      openModal({
        show: true,
        modalType: 6,
        identifiers: {
          folderId: "",
          cardId: "",
        },
      });
      const gptQuery = `${currentCode}
  
      ~~~~~~~~~~~~~~~~~~
      I’ve provided you with code written in ${
        selectedOption.value === "python" ? "cpp" : "python"
      },
      and I'd like you to convert it to ${
        selectedOption.value
      }. Please ignore any non-code text,
      and respond with the output in the following object format, don't return anything else:
      {
        code: "converted code here",
        instruction: "binary instruction code here"
      }


      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Assumptions:
        - Use a dummy 64-bit architecture with a simplified instruction set (e.g., a custom RISC-like architecture).
        - Assume basic operations like loading registers, arithmetic, comparisons, conditional jumps, and printing follow a straightforward opcode system (e.g., 0001 for load, 0010 for add, 0011 for compare, 0100 for jump, 1111 for print).
        - Provide binary instruction codes as if compiled for this dummy architecture.

      Example:
      If given Python code:

      The response should be like below(high priority, also include comments in instruction and include \n in every newline):
      {
        code: "converted code here",
        instruction: '0001 0000 0000 0001  # Load value 1 into R0
0001 0001 0000 0010  # Load value 2 into R1
0001 0010 0000 0011  # Load value 3 into R2
0010 0001 0000 0000  # Add R1 and R0, store in R0'
      }
        `;

      const result = await model.generateContent(gptQuery);
      const response = await result.response;
      const text = await response.text();
      const res = JSON.parse(stripMarkdownWrapper(text));
      console.log(stripMarkdownWrapper(text));

      console.log(res);

      setLanguage(selectedOption);
      setCurrentLanguage(selectedOption.value);
      setCurrentCode(res.code);
      setInstructionCode(res.instruction);
      console.error("coming here 1");
      closeModal();
    } catch (e) {
      console.error("coming here", e);
      alert("Model overload.");
      closeModal();
    }
  };

  return (
    <StyledEditorContainer isFullScreen={isFullScreen}>
      {modalType === 6 && <Loading />}
      {!isFullScreen && (
        <UpperToolBar>
          <Header>
            <Title>
              <h3>{title}</h3>
              <BiEditAlt
                onClick={() =>
                  openModal({
                    show: true,
                    modalType: 5,
                    identifiers: {
                      folderId: folderId,
                      cardId: playgroundId,
                    },
                  })
                }
              />
            </Title>
            <Button onClick={saveCode}>Save code</Button>
          </Header>

          <SelectBars>
            <Select
              options={themeOptions}
              value={currentTheme}
              onChange={handleThemeChange}
            />
            <Select
              options={languageOptions}
              value={language}
              onChange={handleGptSearchClick}
            />
          </SelectBars>
        </UpperToolBar>
      )}

      <CodeEditorContainer>
        <CodeEditor
          currentLanguage={currentLanguage}
          currentTheme={currentTheme.value}
          currentCode={currentCode}
          setCurrentCode={setCurrentCode}
        />
      </CodeEditorContainer>
      <div style={{ padding: instructionCode ? "1rem" : "0rem" }}>
        {instructionCode
          ? instructionCode.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))
          : ""}
      </div>
      <LowerToolBar>
        <button
          onClick={() => {
            setIsFullScreen((isFullScreen) => !isFullScreen);
          }}
        >
          <BiFullscreen /> {isFullScreen ? "Minimize Screen" : "Full Screen"}
        </button>

        <label htmlFor="codefile">
          <input
            type="file"
            accept="."
            id="codefile"
            onChange={(e) => {
              getFile(e, setCurrentCode);
            }}
          />
          <BiImport /> Import Code
        </label>

        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
            currentCode
          )}`}
          download="code.txt"
        >
          <BiExport /> Export Code
        </a>

        <SaveAndRunButton onClick={runCode}>Run Code</SaveAndRunButton>
      </LowerToolBar>
    </StyledEditorContainer>
  );
};

export default EditorContainer;

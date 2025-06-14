import React from "react";
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Addicon from '@mui/icons-material/Add';

const FloatingBtn = ({ onClick }) => {
    return (
        <Box>
            <Fab
                variant="extended"
                color="primary"
                onClick={onClick} // ✅ 클릭 시 다운로드 실행
                style={{
                    height: '40px',
                    borderRadius: '5px',
                    zIndex: 1,
                }}
            >
                <Addicon sx={{ mr: 1 }} />
                Excel 다운로드
            </Fab>
        </Box>
    );
};

export default FloatingBtn
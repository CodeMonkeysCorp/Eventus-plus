UPDATE audit_logs
SET details = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(details, 'Ã¡', 'á'),
                                        'Ã¢', 'â'),
                                    'Ã£', 'ã'),
                                'Ã©', 'é'),
                            'Ãª', 'ê'),
                        'Ã­', 'í'),
                    'Ã³', 'ó'),
                'Ã´', 'ô'),
            'Ãµ', 'õ'),
        'Ãº', 'ú'),
    'Ã§', 'ç'),
'Â', '')
WHERE details LIKE '%Ã%' OR details LIKE '%Â%';

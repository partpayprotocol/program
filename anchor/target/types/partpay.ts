/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/partpay.json`.
 */
export type Partpay = {
  "address": "PARnAABYT9Kuq3sgokcr4Tyz6FY7DUKpiy2Rjrp3jSh",
  "metadata": {
    "name": "partpay",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "confirmDelivery",
      "discriminator": [
        11,
        109,
        227,
        53,
        179,
        190,
        88,
        155
      ],
      "accounts": [
        {
          "name": "equipment",
          "writable": true,
          "relations": [
            "escrow",
            "contract"
          ]
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "account",
                "path": "borrower"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          },
          "relations": [
            "contract"
          ]
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "contract",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  110,
                  112,
                  108,
                  95,
                  99,
                  111,
                  110,
                  116,
                  114,
                  97,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "borrower"
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          }
        },
        {
          "name": "borrower",
          "writable": true,
          "signer": true,
          "relations": [
            "contract"
          ]
        },
        {
          "name": "payeeTokenAccount",
          "writable": true
        },
        {
          "name": "payee"
        },
        {
          "name": "vendor",
          "relations": [
            "equipment"
          ]
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "uniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "confirmFundedDelivery",
      "discriminator": [
        181,
        94,
        145,
        186,
        237,
        179,
        243,
        28
      ],
      "accounts": [
        {
          "name": "equipment",
          "writable": true,
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "account",
                "path": "confirmer"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "confirmer",
          "writable": true,
          "signer": true
        },
        {
          "name": "payeeTokenAccount",
          "writable": true
        },
        {
          "name": "payee"
        },
        {
          "name": "vendor",
          "relations": [
            "equipment"
          ]
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "uniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createContract",
      "discriminator": [
        244,
        48,
        244,
        178,
        216,
        88,
        122,
        52
      ],
      "accounts": [
        {
          "name": "contract",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  110,
                  112,
                  108,
                  95,
                  99,
                  111,
                  110,
                  116,
                  114,
                  97,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "arg",
                "path": "contractUniqueId"
              }
            ]
          }
        },
        {
          "name": "equipment",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "arg",
                "path": "contractUniqueId"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payeeTokenAccount",
          "writable": true
        },
        {
          "name": "payee"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "contractUniqueId",
          "type": "pubkey"
        },
        {
          "name": "totalAmount",
          "type": "u64"
        },
        {
          "name": "installmentFrequency",
          "type": {
            "defined": {
              "name": "installmentFrequency"
            }
          }
        },
        {
          "name": "deposit",
          "type": "u64"
        },
        {
          "name": "insurancePremium",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "funderUniqueId",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "createMarketplace",
      "discriminator": [
        6,
        47,
        242,
        139,
        213,
        113,
        5,
        220
      ],
      "accounts": [
        {
          "name": "marketplace",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  112,
                  108,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "marketplaceCollection",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  112,
                  108,
                  97,
                  99,
                  101,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "marketplace"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "createVendor",
      "discriminator": [
        32,
        63,
        115,
        119,
        35,
        61,
        109,
        155
      ],
      "accounts": [
        {
          "name": "vendor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  110,
                  100,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          }
        },
        {
          "name": "vendorCollection",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  110,
                  100,
                  111,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "vendor"
              },
              {
                "kind": "arg",
                "path": "collectionUniqueId"
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The authority that signs the transaction"
          ],
          "signer": true
        },
        {
          "name": "payer",
          "docs": [
            "The payer of the transaction fees"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "uniqueId",
          "type": "pubkey"
        },
        {
          "name": "collectionUniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "fundEquipmentForBorrowerNoPayment",
      "discriminator": [
        252,
        235,
        49,
        221,
        155,
        229,
        108,
        65
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "arg",
                "path": "borrower"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "equipment",
          "writable": true
        },
        {
          "name": "vendor",
          "writable": true
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "funderTokenAccount",
          "writable": true
        },
        {
          "name": "vendorTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "quantityToFund",
          "type": "u64"
        },
        {
          "name": "borrower",
          "type": "pubkey"
        },
        {
          "name": "uniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "fundEquipmentForBorrowerWithPayment",
      "discriminator": [
        134,
        189,
        214,
        82,
        55,
        82,
        76,
        148
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "arg",
                "path": "borrower"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "equipment",
          "writable": true
        },
        {
          "name": "vendor",
          "writable": true
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "funderTokenAccount",
          "writable": true
        },
        {
          "name": "vendorTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "quantityToFund",
          "type": "u64"
        },
        {
          "name": "borrower",
          "type": "pubkey"
        },
        {
          "name": "minimumDeposit",
          "type": "u64"
        },
        {
          "name": "durationSeconds",
          "type": "i64"
        },
        {
          "name": "uniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "fundEquipmentForListing",
      "discriminator": [
        47,
        200,
        43,
        230,
        255,
        96,
        79,
        56
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              },
              {
                "kind": "account",
                "path": "funder"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "equipment",
          "writable": true
        },
        {
          "name": "vendor",
          "writable": true
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "funderTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "quantityToFund",
          "type": "u64"
        },
        {
          "name": "minimumDeposit",
          "type": "u64"
        },
        {
          "name": "durationSeconds",
          "type": "i64"
        },
        {
          "name": "uniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "getAllVendorEquipment",
      "discriminator": [
        231,
        241,
        214,
        10,
        130,
        4,
        233,
        128
      ],
      "accounts": [
        {
          "name": "vendor"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "vendorEquipmentResponse"
        }
      }
    },
    {
      "name": "getContractStatus",
      "discriminator": [
        122,
        155,
        15,
        34,
        36,
        7,
        165,
        50
      ],
      "accounts": [
        {
          "name": "contract"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "contractStatus"
        }
      }
    },
    {
      "name": "getEquipment",
      "discriminator": [
        38,
        208,
        79,
        149,
        11,
        153,
        97,
        195
      ],
      "accounts": [
        {
          "name": "equipment"
        },
        {
          "name": "vendor"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "equipment"
        }
      }
    },
    {
      "name": "getFunderEquipment",
      "discriminator": [
        52,
        152,
        123,
        193,
        156,
        171,
        13,
        125
      ],
      "accounts": [
        {
          "name": "funder",
          "signer": true
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "funderEquipmentResponse"
        }
      }
    },
    {
      "name": "getVendor",
      "discriminator": [
        65,
        108,
        35,
        15,
        96,
        83,
        147,
        89
      ],
      "accounts": [
        {
          "name": "vendor",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeBorrower",
      "discriminator": [
        218,
        28,
        44,
        131,
        125,
        58,
        215,
        232
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  114,
                  114,
                  111,
                  119,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "creditScore",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  95,
                  115,
                  99,
                  111,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "makePayment",
      "discriminator": [
        19,
        128,
        153,
        121,
        221,
        192,
        91,
        53
      ],
      "accounts": [
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "equipment",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "payeeTokenAccount",
          "writable": true
        },
        {
          "name": "vendor"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "paymentAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "trackRepayment",
      "discriminator": [
        175,
        194,
        248,
        171,
        234,
        88,
        109,
        52
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true
        },
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "vendor"
        },
        {
          "name": "equipment"
        },
        {
          "name": "creditScore",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "onTimeScore",
          "type": "f64"
        },
        {
          "name": "contractUniqueId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateEquipment",
      "discriminator": [
        47,
        212,
        225,
        147,
        96,
        204,
        177,
        12
      ],
      "accounts": [
        {
          "name": "equipment",
          "writable": true
        },
        {
          "name": "vendor",
          "relations": [
            "equipment"
          ]
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "uri",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "price",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "uploadEquipment",
      "discriminator": [
        183,
        46,
        144,
        36,
        181,
        94,
        22,
        46
      ],
      "accounts": [
        {
          "name": "equipment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  113,
                  117,
                  105,
                  112,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vendor"
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "equipmentAsset",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  113,
                  117,
                  105,
                  112,
                  109,
                  101,
                  110,
                  116,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "equipment"
              }
            ]
          }
        },
        {
          "name": "vendor",
          "writable": true
        },
        {
          "name": "vendorCollection",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "totalQuantity",
          "type": "u64"
        },
        {
          "name": "uniqueId",
          "type": "pubkey"
        },
        {
          "name": "minimumDeposit",
          "type": "u64"
        },
        {
          "name": "maxDurationSeconds",
          "type": "i64"
        },
        {
          "name": "paymentPreference",
          "type": {
            "defined": {
              "name": "paymentPreference"
            }
          }
        }
      ]
    },
    {
      "name": "viewCreditScore",
      "discriminator": [
        176,
        65,
        199,
        28,
        12,
        229,
        126,
        7
      ],
      "accounts": [
        {
          "name": "creditScore",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  95,
                  115,
                  99,
                  111,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "borrower"
        }
      ],
      "args": [],
      "returns": "u64"
    }
  ],
  "accounts": [
    {
      "name": "bnplContract",
      "discriminator": [
        154,
        98,
        155,
        16,
        56,
        83,
        206,
        15
      ]
    },
    {
      "name": "borrower",
      "discriminator": [
        16,
        108,
        79,
        55,
        224,
        190,
        158,
        199
      ]
    },
    {
      "name": "creditScore",
      "discriminator": [
        236,
        13,
        61,
        31,
        37,
        3,
        34,
        202
      ]
    },
    {
      "name": "equipment",
      "discriminator": [
        96,
        101,
        21,
        125,
        255,
        60,
        106,
        143
      ]
    },
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    },
    {
      "name": "marketplace",
      "discriminator": [
        70,
        222,
        41,
        62,
        78,
        3,
        32,
        174
      ]
    },
    {
      "name": "vendor",
      "discriminator": [
        87,
        248,
        121,
        239,
        24,
        112,
        197,
        200
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedBuyer",
      "msg": "The provided buyer is not authorized to make this payment"
    },
    {
      "code": 6001,
      "name": "contractAlreadyCompleted",
      "msg": "The contract is already completed"
    },
    {
      "code": 6002,
      "name": "failedToCreateCollection",
      "msg": "Failed to create collection"
    },
    {
      "code": 6003,
      "name": "clockUnavailable",
      "msg": "Clock is unavailable"
    },
    {
      "code": 6004,
      "name": "invalidVendor",
      "msg": "Invalid contract vendor"
    },
    {
      "code": 6005,
      "name": "invalidEquipment",
      "msg": "Failed to mint NFT receipt"
    },
    {
      "code": 6006,
      "name": "failedToMintNft",
      "msg": "Invalid equipment"
    },
    {
      "code": 6007,
      "name": "metaplexError",
      "msg": "Error invoking Metaplex Core program"
    },
    {
      "code": 6008,
      "name": "marketplaceAlreadyExists",
      "msg": "Marketplace already exists"
    },
    {
      "code": 6009,
      "name": "invalidMarketplaceAuthority",
      "msg": "Invalid Marketplace Authority"
    },
    {
      "code": 6010,
      "name": "mathOverflow",
      "msg": "Math operation resulted in overflow"
    },
    {
      "code": 6011,
      "name": "invalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6012,
      "name": "firstPaymentBelowDeposit",
      "msg": "First payment must meet the minimum payment"
    },
    {
      "code": 6013,
      "name": "invalidDuration",
      "msg": "Invalid duration"
    },
    {
      "code": 6014,
      "name": "invalidInsurancePremium",
      "msg": "Invalid insurance premium"
    },
    {
      "code": 6015,
      "name": "equipmentNotFound",
      "msg": "Equipment not found"
    },
    {
      "code": 6016,
      "name": "invalidEquipmentUpdate",
      "msg": "Invalid equipment update"
    },
    {
      "code": 6017,
      "name": "invalidEquipmentPrice",
      "msg": "Equipment price must be greater than zero"
    },
    {
      "code": 6018,
      "name": "invalidEquipmentName",
      "msg": "Equipment name must not be empty"
    },
    {
      "code": 6019,
      "name": "invalidEquipmentUri",
      "msg": "Equipment URI must be valid"
    },
    {
      "code": 6020,
      "name": "unauthorizedEquipmentUpdate",
      "msg": "Unauthorized equipment update"
    },
    {
      "code": 6021,
      "name": "invalidStringLength",
      "msg": "String length is invalid"
    },
    {
      "code": 6022,
      "name": "invalidUri",
      "msg": "Invalid URI"
    },
    {
      "code": 6023,
      "name": "invalidName",
      "msg": "Invalid name"
    },
    {
      "code": 6024,
      "name": "invalidInstallmentFrequency",
      "msg": "Invalid installment frequency"
    },
    {
      "code": 6025,
      "name": "buyerSignatureRequired",
      "msg": "The buyer must sign this transaction."
    },
    {
      "code": 6026,
      "name": "sellerSignatureRequired",
      "msg": "The seller must sign this transaction."
    },
    {
      "code": 6027,
      "name": "invalidPaymentAmount",
      "msg": "Invalid payment amount"
    },
    {
      "code": 6028,
      "name": "overpayment",
      "msg": "overpayment"
    },
    {
      "code": 6029,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    },
    {
      "code": 6030,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6031,
      "name": "borrowerMismatch",
      "msg": "Borrower does not match credit score record"
    },
    {
      "code": 6032,
      "name": "invalidCreditScorePda",
      "msg": "Invalid credit score PDA"
    },
    {
      "code": 6033,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6034,
      "name": "invalidSellerTokenAccount",
      "msg": "Invalid  seller account"
    },
    {
      "code": 6035,
      "name": "invalidBuyerTokenAccount",
      "msg": "Invalid  buyer account"
    },
    {
      "code": 6036,
      "name": "outOfStock",
      "msg": "Equipment is out of stock"
    },
    {
      "code": 6037,
      "name": "noRemainingQuantity",
      "msg": "No remaining quantity"
    },
    {
      "code": 6038,
      "name": "loanNotFound",
      "msg": "Loan not found for this borrower"
    },
    {
      "code": 6039,
      "name": "depositBelowMinimum",
      "msg": "Deposit is below the minimum set by the vendor"
    },
    {
      "code": 6040,
      "name": "durationExceedsMax",
      "msg": "Duration exceeds the maximum allowed by the vendor"
    },
    {
      "code": 6041,
      "name": "invalidPayee",
      "msg": "Invalid payee"
    },
    {
      "code": 6042,
      "name": "insufficientQuantity",
      "msg": "Insufficient quantity available"
    },
    {
      "code": 6043,
      "name": "tokenTransferFailed",
      "msg": "Failed to transfer tokens"
    },
    {
      "code": 6044,
      "name": "invalidContract",
      "msg": "Invalid contract"
    },
    {
      "code": 6045,
      "name": "invalidEscrow",
      "msg": "Invalid escrow"
    },
    {
      "code": 6046,
      "name": "invalidFrequency",
      "msg": "Invalid frequency. should greater than 0"
    },
    {
      "code": 6047,
      "name": "tooManyInstallments",
      "msg": "Too many instalment plan"
    },
    {
      "code": 6048,
      "name": "invalidPaymentPreference",
      "msg": "Invalid payment preference"
    },
    {
      "code": 6049,
      "name": "noAvailableFunder",
      "msg": "Funder doesn't exist"
    },
    {
      "code": 6050,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6051,
      "name": "invalidTokenOwner",
      "msg": "Invalid token owner"
    },
    {
      "code": 6052,
      "name": "equipmentNotAvailable",
      "msg": "Equipment not available"
    },
    {
      "code": 6053,
      "name": "fundsAlreadyReleased",
      "msg": "Funds have already been released from escrow"
    },
    {
      "code": 6054,
      "name": "invalidDeliveryStatus",
      "msg": "Invalid delivery status for confirmation"
    },
    {
      "code": 6055,
      "name": "missingFunderUniqueId",
      "msg": "Funder unique ID is required for funded equipment"
    },
    {
      "code": 6056,
      "name": "noFundedUnitsAvailable",
      "msg": "No Funder Find"
    },
    {
      "code": 6057,
      "name": "unauthorized",
      "msg": "Unauthorized action"
    }
  ],
  "types": [
    {
      "name": "bnplContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "payee",
            "type": "pubkey"
          },
          {
            "name": "equipment",
            "type": "pubkey"
          },
          {
            "name": "equipmentUnitIndex",
            "type": "u64"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "amountPaid",
            "type": "u64"
          },
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "contractUniqueId",
            "type": "pubkey"
          },
          {
            "name": "lastPaymentDate",
            "type": "i64"
          },
          {
            "name": "installmentCount",
            "type": "u8"
          },
          {
            "name": "paidInstallments",
            "type": "u8"
          },
          {
            "name": "installmentFrequency",
            "type": {
              "defined": {
                "name": "installmentFrequency"
              }
            }
          },
          {
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "name": "insurancePremium",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "isInsured",
            "type": "bool"
          },
          {
            "name": "creditScoreDelta",
            "type": "i8"
          },
          {
            "name": "stablecoinMint",
            "type": "pubkey"
          },
          {
            "name": "escrow",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "borrower",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "borrowerPubkey",
            "type": "pubkey"
          },
          {
            "name": "creditScore",
            "type": "pubkey"
          },
          {
            "name": "totalLoans",
            "type": "u64"
          },
          {
            "name": "totalRepayments",
            "type": "u64"
          },
          {
            "name": "lastRepaymentDate",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contractStatus",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "progress",
            "type": "u8"
          },
          {
            "name": "totalDue",
            "type": "u64"
          },
          {
            "name": "remainingAmount",
            "type": "u64"
          },
          {
            "name": "timeSinceLastPayment",
            "type": "i64"
          },
          {
            "name": "isPaymentOverdue",
            "type": "bool"
          },
          {
            "name": "nextPaymentDue",
            "type": "i64"
          },
          {
            "name": "insurancePremium",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "creditScore",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "onTimePayments",
            "type": "u32"
          },
          {
            "name": "latePayments",
            "type": "u32"
          },
          {
            "name": "defaults",
            "type": "u32"
          },
          {
            "name": "score",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "deliveryStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "shipped"
          },
          {
            "name": "delivered"
          },
          {
            "name": "disputed"
          }
        ]
      }
    },
    {
      "name": "equipment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vendor",
            "type": "pubkey"
          },
          {
            "name": "asset",
            "type": "pubkey"
          },
          {
            "name": "uniqueId",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "minimumDeposit",
            "type": "u64"
          },
          {
            "name": "maxDurationSeconds",
            "type": "i64"
          },
          {
            "name": "paymentPreference",
            "type": {
              "defined": {
                "name": "paymentPreference"
              }
            }
          },
          {
            "name": "totalQuantity",
            "type": "u64"
          },
          {
            "name": "fundedQuantity",
            "type": "u64"
          },
          {
            "name": "soldQuantity",
            "type": "u64"
          },
          {
            "name": "fundedSoldQuantity",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "equipmentStatus"
              }
            }
          },
          {
            "name": "funders",
            "type": {
              "vec": {
                "defined": {
                  "name": "funderInfo"
                }
              }
            }
          },
          {
            "name": "deliveryStatus",
            "type": {
              "defined": {
                "name": "deliveryStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "equipmentInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "asset",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "equipmentStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "available"
          },
          {
            "name": "funded"
          },
          {
            "name": "partiallySold"
          },
          {
            "name": "sold"
          },
          {
            "name": "reserved"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "equipment",
            "type": "pubkey"
          },
          {
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "vendor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "isReleased",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "funderEquipmentInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "equipmentPda",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "asset",
            "type": "pubkey"
          },
          {
            "name": "fundedQuantity",
            "type": "u64"
          },
          {
            "name": "totalQuantity",
            "type": "u64"
          },
          {
            "name": "minimumDeposit",
            "type": "u64"
          },
          {
            "name": "durationSeconds",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "funderEquipmentResponse",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalCount",
            "type": "u64"
          },
          {
            "name": "equipment",
            "type": {
              "vec": {
                "defined": {
                  "name": "funderEquipmentInfo"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "funderInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "minimumDeposit",
            "type": "u64"
          },
          {
            "name": "durationSeconds",
            "type": "i64"
          },
          {
            "name": "borrower",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "escrow",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "installmentFrequency",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "daily"
          },
          {
            "name": "weekly"
          },
          {
            "name": "monthly"
          },
          {
            "name": "custom",
            "fields": [
              {
                "name": "seconds",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "marketplace",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "collection",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "paymentPreference",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "part"
          },
          {
            "name": "full"
          },
          {
            "name": "both",
            "fields": [
              {
                "name": "timeout",
                "type": "i64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "vendor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "collection",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "marketplace",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "equipments",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "vendorStatus"
              }
            }
          },
          {
            "name": "uniqueId",
            "type": "pubkey"
          },
          {
            "name": "collectionUniqueId",
            "type": "pubkey"
          },
          {
            "name": "equipmentCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vendorEquipmentResponse",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalCount",
            "type": "u64"
          },
          {
            "name": "equipment",
            "type": {
              "vec": {
                "defined": {
                  "name": "equipmentInfo"
                }
              }
            }
          },
          {
            "name": "failedLoads",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "vendorStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "suspended"
          },
          {
            "name": "deactivated"
          }
        ]
      }
    }
  ]
};

import { useEffect, useState } from "react";
import type { Order } from "../types/order";
import api from "../api/axios";
import axios from "axios";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Snackbar,
  Typography,
  type SnackbarCloseReason,
} from "@mui/material";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [backdropOpen, setBackdropOpen] = useState(false);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/my");
        setOrders(res.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Something went wrong");
        } else {
          setError("Unexpected error");
        }
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const handleClickOpen = (order: Order) => {
    setOpen(true);
    setSelectedOrder(order);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancellation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setCancelDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setCancelDialogOpen(false);
  };

  const handleConfirmCancellation = async (orderId: string) => {
    try {
      setBackdropOpen(true);
      await api.patch(`orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "cancelled" } : o,
        ),
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: "cancelled" } : null,
      );
      setCancelDialogOpen(false);
      setOpen(false);
      setSnackbar({
        open: true,
        message: "Order cancelled successfully",
        severity: "success",
      });
    } catch (error) {
      let errorMessage = "";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || "Something went wrong";
      } else {
        errorMessage = "Something went wrong";
      }
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setBackdropOpen(false);
    }
  };
  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };
  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Skeleton width="60%" height={100} />
        <Skeleton width="60%" height={100} />
        <Skeleton width="60%" height={100} />
        <Skeleton width="60%" height={100} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return orders.length === 0 ? (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <Typography sx={{ fontSize: 50 }}>No orders</Typography>
    </Container>
  ) : (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>
      <Card
        sx={{
          width: "80%",
          mt: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 2,
          p: 4,
          boxShadow: 3,
        }}
      >
        {orders.map((item) => (
          <Box
            key={item._id}
            sx={{
              width: "95%",
              mt: 1,
              display: "flex",
              justifyContent: "space-between",
              borderRadius: 2,
              p: 1,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                Order Id: #{item._id.slice(-6)}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                Status:
                <Typography
                  component="span"
                  sx={{
                    backgroundColor:
                      item.status === "pending"
                        ? "#fff3e0"
                        : item.status === "processing"
                          ? "#e3f2fd"
                          : item.status === "completed"
                            ? "#e8f5e9"
                            : "#fdecea",
                    color:
                      item.status === "pending"
                        ? "#ed6c02"
                        : item.status === "processing"
                          ? "#1565c0"
                          : item.status === "completed"
                            ? "#2e7d32"
                            : "#c62828",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: 2,
                    borderRadius: 2,
                    paddingX: 1,
                  }}
                >
                  {item.status}
                </Typography>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#413e3e" }}>
                Total Amount: ${item.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: "column",
                gap: 1,
                m: 3,
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                sx={{ backgroundColor: "#333" }}
                onClick={() => handleClickOpen(item)}
              >
                See Details
              </Button>
            </Box>
          </Box>
        ))}
      </Card>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="order-details-title"
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "#00000033",
            backdropFilter: "blur(8px)",
          },
        }}
        slotProps={{
          transition: {
            onExited: () => setSelectedOrder(null),
          },
        }}
        fullWidth
      >
        <DialogTitle
          id="order-details-title"
          sx={{ fontWeight: 700, fontSize: 30 }}
        >
          Order Details
        </DialogTitle>
        <DialogContent>
          <Box>
            {selectedOrder?.items.map((item) => (
              <Box
                key={item._id}
                sx={{
                  mt: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  m: 1.5,
                  borderBottom: "1px #333 solid",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, fontSize: 17 }}
                  noWrap
                >
                  {item.title}
                </Typography>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#3e3b3b" }}>
                    Price: ${item.priceAtPurchase.toFixed(2)}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "#3e3b3b" }}>
                    Quantity: {item.quantity}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Typography
              sx={{
                textAlign: "end",
                pr: 2,
                fontWeight: 500,
                fontSize: 22,
                pt: 1,
              }}
            >
              Total Amount: ${selectedOrder?.totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedOrder?.status === "pending" && (
            <Button
              variant="contained"
              color="error"
              size="small"
              sx={{ borderRadius: 5, px: 2, py: 1 }}
              onClick={handleCancellation}
            >
              Cancel Order
            </Button>
          )}
          <Button onClick={handleClose} sx={{ color: "#333" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseConfirm}
        aria-labelledby="confirm-cancel-title"
        aria-describedby="confirm-cancel-description"
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "#00000033",
            backdropFilter: "blur(8px)",
          },
        }}
        fullWidth
      >
        <DialogTitle id="confirm-cancel-title">Cancel Order?</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-cancel-description">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseConfirm}>
            Go Back
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleConfirmCancellation(selectedOrder!._id)}
            disabled={backdropOpen}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>{" "}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={(theme) => ({ color: "#0e0d0d", zIndex: theme.zIndex.modal + 1 })}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default MyOrdersPage;
